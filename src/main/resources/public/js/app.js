
const view = new View();



window.addEventListener('load', function() {
    var idToken;
    var accessToken;
    var expiresAt;

    var webAuth = new auth0.WebAuth({
        domain: 'dev-4orq9ks7.eu.auth0.com/',
        clientID: 'BP2WeTQdVt65XALxoZ38J2JIeDql13EO',
        responseType: 'token id_token',
        scope: 'openid profile read:admin',
        redirectUri: location.href,
        audience: 'https://todo/api'
    });

    var loginBtn = document.getElementById('btn-login');

    loginBtn.addEventListener('click', function(e) {
        console.log(webAuth)
        e.preventDefault();
        webAuth.authorize();
    });

    var loginStatus = document.querySelector('.container h4');
    var loginView = document.getElementById('login-view');
    var homeView = document.getElementById('home-view');

    // buttons and event listeners
    var homeViewBtn = document.getElementById('btn-home-view');

    homeViewBtn.addEventListener('click', function() {
        homeView.style.display = 'inline-block';
        loginView.style.display = 'none';
    });

    var logoutBtn = document.getElementById('btn-logout');

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
            console.log("controller instantiated")
            new Controller(view);
        });
    }

    function localLogin(authResult) {
        // Set isLoggedIn flag in localStorage
        sessionStorage.setItem('isLoggedIn', 'true');
        // Set the time that the access token will expire at
        expiresAt = JSON.stringify(
            authResult.expiresIn * 1000 + new Date().getTime()
        );
        accessToken = authResult.accessToken;
        console.log("token");
        sessionStorage.setItem('accessToken', accessToken);
        idToken = authResult.idToken;
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
        sessionStorage.removeItem('isLoggedIn');
        sessionStorage.removeItem('accessToken');
        // Remove tokens and expiry time
        accessToken = '';
        idToken = '';
        expiresAt = 0;
        displayButtons();
    }

    function isAuthenticated() {
        // Check whether the current time is past the
        // Access Token's expiry time
        var expiration = parseInt(expiresAt) || 0;
        return sessionStorage.getItem('isLoggedIn') === 'true' && new Date().getTime() < expiration;
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
    }

    if (sessionStorage.getItem('isLoggedIn') === 'true') {
        console.log("renew token")
        renewTokens();
    } else {
        console.log("handleAuthentication")
        handleAuthentication();
    }

});
