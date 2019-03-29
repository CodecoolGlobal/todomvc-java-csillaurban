import {WebAuth} from "auth0-js";

const view = new View();

new Controller(view);

window.addEventListener('load', function() {
    scheduleRenewal();

    let idToken;
    let accessToken;
    let expiresAt;
    let scopes;

    let userProfile;
    let content = document.querySelector('.content');
    let loadingSpinner = document.getElementById('loading');
    content.style.display = 'block';
    loadingSpinner.style.display = 'none';

    var tokenRenewalTimeout;

    let requestedScopes = 'openid profile read:admin';

    let webAuth = new WebAuth({
        domain: 'dev-4orq9ks7.eu.auth0.com',
        clientID: 'tfEORseZKkv2kHIUxReL8V9fsavPR2Ax',
        responseType: 'token id_token',
        redirectUri: window.location.href,
        audience: 'https://todo-assignment',
        scope: requestedScopes
    });

    let loginStatus = document.querySelector('.container h4');
    let loginView = document.getElementById('login-view');
    let homeView = document.getElementById('home-view');

    let homeViewBtn = document.getElementById('btn-home-view');
    let logoutBtn = document.getElementById('btn-logout');
    let loginBtn = document.getElementById('btn-login');

    homeViewBtn.addEventListener('click', function() {
        homeView.style.display = 'inline-block';
        loginView.style.display = 'none';
    });

    loginBtn.addEventListener('click', function(e) {
        e.preventDefault();
        webAuth.authorize();
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
        localStorage.setItem('accessToken', accessToken);
        idToken = authResult.idToken;
        scheduleRenewal();
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
        localStorage.removeItem('accessToken');
        accessToken = '';
        idToken = '';
        expiresAt = 0;
        displayButtons();
        location.reload();
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
        if (!isAuthenticated || !userHasScopes(['read:admin'])) {
            adminViewBtn.style.display = 'none';
        } else {
            adminViewBtn.style.display = 'inline-block';
        }
    }

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
        let url = apiUrl + endpoint;
        console.log("call api");
        console.log(url);
        let xhr = new XMLHttpRequest();
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
        let grantedScopes = scopes.split(' ');
        for (let i = 0; i < requiredScopes.length; i++) {
            if (grantedScopes.indexOf(requiredScopes[i]) < 0) {
                return false;
            }
        }
        return true;
    }

    function scheduleRenewal() {
        let delay = expiresAt - Date.now();
        if (delay > 0) {
            tokenRenewalTimeout = setTimeout(function() {
                renewTokens();
            }, delay);
        }
    }



});