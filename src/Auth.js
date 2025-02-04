const firebaseConfig = {
    apiKey: "AIzaSyAfGAIhUNAFY1VgZmtp71edZjMF3Ss1hCE",
    authDomain: "tamawebdb.firebaseapp.com",
    projectId: "tamawebdb",
    storageBucket: "tamawebdb.firebasestorage.app",
    messagingSenderId: "405198385098",
    appId: "1:405198385098:web:2562998641a31ec976a933",
    measurementId: "G-LWNYV05LFT"
};

const Auth = (() => {
    firebase.initializeApp(firebaseConfig);
    firestore = firebase.firestore();
    auth = firebase.auth();

    const setCookie = (uid) => {
        if(uid === undefined){
            document.cookie = "userId=;path=/;max-age=0";
            return;
        }
        document.cookie = `userId=${uid};path=/;max-age=31536000`;
    }

    const signUp = (email, password, userData) => {
        return auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log("User signed up: ", user);
                setCookie(user.uid);
                return firestore.collection('users').doc(user.uid).set(userData);
            })
            .then(() => {
                console.log("User data posted to Firestore");
            })
            .catch((error) => {
                console.error("Error signing up: ", error.message);
            });
    };

    const signIn = (email, password) => {
        return auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log("User signed in: ", user);
                setCookie(user.uid);
            })
            .catch((error) => {
                console.error("Error signing in: ", error.message);
            });
    };

    const signOut = () => {
        return auth.signOut()
            .then(() => {
                console.log("User signed out");
                setCookie();
            })
            .catch((error) => {
                console.error("Error signing out: ", error.message);
            });
    };

    const getCurrentUser = () => {
        const userCookie = document.cookie.split("; ").find(row => row.startsWith("userId="));
        if (userCookie) {
            return userCookie.split("=")[1];
        }
        return null;
    };

    const postUserData = (data) => {
        const userId = getCurrentUser();
        if(!userId) return false;
        return firestore.collection('users').doc(userId).set(data, { merge: true })
            .then(() => {
                console.log("User data posted to Firestore");
            })
            .catch((error) => {
                console.error("Error posting user data: ", error.message);
                handleError(error.code);
            });
    };

    const getUserData = () => {
        const userId = getCurrentUser();
        if(!userId) return false;
        return firestore.collection('users').doc(userId).get()
            .then((doc) => {
                if (doc.exists) {
                    console.log("User data: ", doc.data());
                    return doc.data();
                } else {
                    console.log("No such document!");
                    return null;
                }
            })
            .catch((error) => {
                console.error("Error getting user data: ", error.message);
                handleError(error.code);
            });
    };

    const handleError = (code) => {
        switch(code){
            case "permission-denied":
                setCookie();
        }
    }

    return {
        signUp,
        signIn,
        signOut,
        getCurrentUser,
        postUserData,
        getUserData
    };
})();
