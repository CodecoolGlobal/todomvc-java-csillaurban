const view = new View();

new Controller(view);

window.addEventListener('load', function() {
    scheduleRenewal();
    var idToken;
    var accessToken;
    var expiresAt;

    var requestedScopes = 'openid profile read:admin';
    var content = document.querySelector('.content');
    var loadingSpinner = document.getElementById('loading');
    content.style.display = 'block';
    loadingSpinner.style.display = 'none';
    var tokenRenewalTimeout;

    var webAuth = new auth0.WebAuth({
        domain: 'dev-4orq9ks7.eu.auth0.com',
        clientID: '_Oj90Egu-6A3wzZ-53Jzhu2IdGPjbcXs',
        responseType: 'token id_token',
        redirectUri: window.location.href,
        audience: 'https://todo-assignment',
        scope: requestedScopes
    });

    // buttons and event listeners
    var homeViewBtn = document.getElementById('btn-home-view');
    var logoutBtn = document.getElementById('btn-logout');
    var loginBtn = document.getElementById('btn-login');

    loginBtn.addEventListener('click', function(e) {
        e.preventDefault();
        webAuth.authorize();
    });

    var loginStatus = document.querySelector('.container h4');
    var loginView = document.getElementById('login-view');
    var homeView = document.getElementById('home-view');

    homeViewBtn.addEventListener('click', function() {
        homeView.style.display = 'inline-block';
        loginView.style.display = 'none';
    });

    logoutBtn.addEventListener('click', logout);

    function handleAuthentication() {
        webAuth.parseHash(function(err, authResult) {
            if (authResult && authResult.accessToken && authResult.idToken) {
                window.location.hash = '';
                localLogin(authResult);
                loginBtn.style.display = 'none';
                homeView.style.display = 'inline-block';
            } else if (err) {
                homeView.style.display = 'inline-block';
                console.log(err);
                alert(
                    'Error: ' + err.error + '. Check the console for further details.'
                );
            }
            displayButtons();
        });
    }

    function localLogin(authResult) {
        // Set isLoggedIn flag in localStorage
        localStorage.setItem('isLoggedIn', 'true');
        // Set the time that the access token will expire at
        expiresAt = JSON.stringify(
            authResult.expiresIn * 1000 + new Date().getTime()
        );
        accessToken = authResult.accessToken;
        idToken = authResult.idToken;
        scopes = authResult.scope || requestedScopes || '';
    }

    function renewTokens() {
        webAuth.checkSession({}, (err, authResult) => {
            if (authResult && authResult.accessToken && authResult.idToken) {
                localLogin(authResult);
            } else if (err) {
                alert(
                    'Could not get a new token '  + err.error + ':' + err.error_description + '.'
                );
                logout();
            }
            displayButtons();
        });
    }

    function logout() {
        // Remove isLoggedIn flag from localStorage
        localStorage.removeItem('isLoggedIn');
        // Remove tokens and expiry time
        accessToken = '';
        idToken = '';
        expiresAt = 0;
        displayButtons();
        clearTimeout(tokenRenewalTimeout);
    }

    function isAuthenticated() {
        // Check whether the current time is past the
        // Access Token's expiry time
        var expiration = parseInt(expiresAt) || 0;
        return localStorage.getItem('isLoggedIn') === 'true' && new Date().getTime() < expiration;
    }

    function displayButtons() {
        if (isAuthenticated()) {
            loginBtn.style.display = 'none';
            logoutBtn.style.display = 'inline-block';
            loginStatus.innerHTML = 'You are logged in!';
        } else {
            loginBtn.style.display = 'inline-block';
            logoutBtn.style.display = 'none';
            loginStatus.innerHTML =
                'You are not logged in! Please log in to continue.';
        }
        if (!isAuthenticated || !userHasScopes(['write:messages'])) {
            adminViewBtn.style.display = 'none';
        } else {
            adminViewBtn.style.display = 'inline-block';
        }
    }

    var userProfile;

    function getProfile() {
        if (!userProfile) {
            if (!accessToken) {
                console.log('Access Token must exist to fetch profile');
            }

            webAuth.client.userInfo(accessToken, function(err, profile) {
                if (profile) {
                    userProfile = profile;
                    displayProfile();
                }
            });
        } else {
            displayProfile();
        }
    }

    function displayProfile() {
        // display the profile
        document.querySelector('#profile-view .nickname').innerHTML =
            userProfile.nickname;

        document.querySelector(
            '#profile-view .full-profile'
        ).innerHTML = JSON.stringify(userProfile, null, 2);

        document.querySelector('#profile-view img').src = userProfile.picture;
    }

    if (localStorage.getItem('isLoggedIn') === 'true') {
        renewTokens();
    } else {
        handleAuthentication();
    }


    function callAPI(endpoint, secured) {
        var url = apiUrl + endpoint;
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        if (secured) {
            xhr.setRequestHeader(
                'Authorization',
                'Bearer ' + accessToken
            );
        }
        xhr.onload = function() {
            if (xhr.status == 200) {
                // update message
                document.querySelector('#ping-view h2').innerHTML = JSON.parse(
                    xhr.responseText
                ).message;
            } else {
                alert('Request failed: ' + xhr.statusText);
            }
        };
        xhr.send();
    }

    function userHasScopes(requiredScopes) {
        if (!scopes) return false;
        var grantedScopes = scopes.split(' ');
        for (var i = 0; i < requiredScopes.length; i++) {
            if (grantedScopes.indexOf(requiredScopes[i]) < 0) {
                return false;
            }
        }
        return true;
    }

    function renewTokens() {
        webAuth.checkSession({},
            function(err, result) {
                if (err) {
                    console.log(err);
                } else {
                    localLogin(result);
                }
            }
        );
    }

    function scheduleRenewal() {
        var delay = expiresAt - Date.now();
        if (delay > 0) {
            tokenRenewalTimeout = setTimeout(function() {
                renewTokens();
            }, delay);
        }
    }

    function localLogin(authResult) {
        // Set isLoggedIn flag in localStorage
        localStorage.setItem('isLoggedIn', 'true');
        // Set the time that the access token will expire at
        expiresAt = JSON.stringify(
            authResult.expiresIn * 1000 + new Date().getTime()
        );
        accessToken = authResult.accessToken;
        idToken = authResult.idToken;
        scheduleRenewal();
    }

});