// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCY-Q1dfUVZkdIVjj7bCuZlDhnU3DG7X40",
    authDomain: "student-records-bb3c7.firebaseapp.com",
    databaseURL: "https://student-records-bb3c7-default-rtdb.firebaseio.com",
    projectId: "student-records-bb3c7",
    storageBucket: "student-records-bb3c7.appspot.com",
    messagingSenderId: "549805401271",
    appId: "1:549805401271:web:e1f0a4350b0fda98281932"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Function to create a new post
function createPost() {
    const imageInput = document.getElementById('imageInput');
    const textInput = document.getElementById('textInput');

    const imageFile = imageInput.files[0];
    const text = textInput.value;

    if (!imageFile || !text) {
        alert('Please select an image and write something.');
        return;
    }

    // Upload image to Firebase Storage
    const storageRef = firebase.storage().ref();
    const imageName = new Date().getTime() + '_' + imageFile.name;
    const imageRef = storageRef.child('images/' + imageName);

    imageRef.put(imageFile).then((snapshot) => {
        // Get download URL for the image
        snapshot.ref.getDownloadURL().then((imageUrl) => {
            // Save post data to Firestore
            db.collection('posts').add({
                image: imageUrl,
                text: text,
                likes: 0,
                comments: [],
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            }).then(() => {
                // Clear form fields after successful upload
                imageInput.value = '';
                textInput.value = '';
            }).catch((error) => {
                console.error('Error adding post to Firestore: ', error);
            });
        });
    });
}

// Function to display posts
function displayPosts() {
    const postsContainer = document.getElementById('postsContainer');
    postsContainer.innerHTML = ''; // Clear existing posts

    // Get posts from Firestore
    db.collection('posts').orderBy('timestamp', 'desc').get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const post = doc.data();
                const postElement = document.createElement('div');
                postElement.classList.add('post');

                const imageElement = document.createElement('img');
                imageElement.src = post.image;
                postElement.appendChild(imageElement);

                const textElement = document.createElement('p');
                textElement.textContent = post.text;
                postElement.appendChild(textElement);

                const likeButton = document.createElement('button');
                likeButton.textContent = `Like (${post.likes})`;
                likeButton.onclick = function() {
                    likePost(doc.id, post.likes);
                };
                postElement.appendChild(likeButton);

                const commentInput = document.createElement('input');
                commentInput.type = 'text';
                commentInput.placeholder = 'Add a comment...';
                postElement.appendChild(commentInput);

                const commentButton = document.createElement('button');
                commentButton.textContent = 'Comment';
                commentButton.onclick = function() {
                    addComment(doc.id, commentInput.value);
                    commentInput.value = '';
                };
                postElement.appendChild(commentButton);

                // Display comments
                const commentList = document.createElement('ul');
                post.comments.forEach(comment => {
                    const listItem = document.createElement('li');
                    listItem.textContent = comment;
                    commentList.appendChild(listItem);
                });
                postElement.appendChild(commentList);

                postsContainer.appendChild(postElement);
            });
        })
        .catch((error) => {
            console.error('Error getting posts from Firestore: ', error);
        });
}

// Function to like a post
function likePost(postId, currentLikes) {
    const updatedLikes = currentLikes + 1;
    db.collection('posts').doc(postId).update({
        likes: updatedLikes
    }).then(() => {
        displayPosts(); // Refresh posts after updating likes
    }).catch((error) => {
        console.error('Error updating likes for post: ', error);
    });
}

// Function to add a comment to a post
function addComment(postId, commentText) {
    db.collection('posts').doc(postId).update({
        comments: firebase.firestore.FieldValue.arrayUnion(commentText)
    }).then(() => {
        displayPosts(); // Refresh posts after adding comment
    }).catch((error) => {
        console.error('Error adding comment to post: ', error);
    });
}

// Display posts when the page loads
window.addEventListener('DOMContentLoaded', displayPosts);
