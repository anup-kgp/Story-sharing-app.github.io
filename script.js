let posts = []; // Initialize posts array

// Load posts from local storage on page load
window.addEventListener('DOMContentLoaded', function() {
    const savedPosts = localStorage.getItem('posts');
    if (savedPosts) {
        try {
            posts = JSON.parse(savedPosts);
            posts.forEach(post => {
                displayPost(post);
            });
        } catch (error) {
            console.error('Error parsing saved posts:', error);
        }
    }
});

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

    const post = {
        id: generateId(),
        image: URL.createObjectURL(imageFile),
        text: text,
        likes: 0,
        comments: []
    };

    posts.push(post);
    displayPost(post);

    // Save posts to local storage
    savePostsToLocalStorage();

    // Clear form fields
    imageInput.value = '';
    textInput.value = '';
}

// Function to generate unique IDs
function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

// Function to display a post
function displayPost(post) {
    const postsContainer = document.getElementById('postsContainer');

    const postElement = document.createElement('div');
    postElement.classList.add('post');
    postElement.dataset.id = post.id;

    const imageElement = document.createElement('img');
    imageElement.src = post.image;
    postElement.appendChild(imageElement);

    const textElement = document.createElement('p');
    textElement.textContent = post.text;
    postElement.appendChild(textElement);

    const likeCommentSection = document.createElement('div');
    likeCommentSection.classList.add('like-comment-section');

    const likeSection = document.createElement('div');
    likeSection.classList.add('like-section');
    const likeButton = document.createElement('button');
    likeButton.textContent = `Like (${post.likes})`;
    likeButton.onclick = function() {
        likePost(post);
    };
    likeSection.appendChild(likeButton);
    likeCommentSection.appendChild(likeSection);

    const commentSection = document.createElement('div');
    commentSection.classList.add('comment-section');
    const commentInput = document.createElement('input');
    commentInput.type = 'text';
    commentInput.placeholder = 'Add a comment...';
    const commentButton = document.createElement('button');
    commentButton.textContent = 'Comment';
    commentButton.onclick = function() {
        addComment(post, commentInput.value);
        commentInput.value = '';
    };
    const commentCount = document.createElement('span');
    commentCount.textContent = `Comments (${post.comments.length})`;
    const commentList = document.createElement('ul');
    post.comments.forEach(comment => {
        const listItem = document.createElement('li');
        listItem.textContent = `${comment.text} - ${comment.timestamp}`;
        commentList.appendChild(listItem);
    });
    commentSection.appendChild(commentInput);
    commentSection.appendChild(commentButton);
    commentSection.appendChild(commentCount);
    commentSection.appendChild(commentList);
    likeCommentSection.appendChild(commentSection);

    postElement.appendChild(likeCommentSection);

    postsContainer.appendChild(postElement);
}

// Function to like a post
function likePost(post) {
    if (post.likes < 500) {
        post.likes++;
        updateLikeCount(post);
        savePostsToLocalStorage(); // Save posts to local storage after updating like count
    } else {
        alert('You have reached the maximum number of likes (500).');
    }
}

// Function to update like count
function updateLikeCount(post) {
    const postElement = document.querySelector(`.post[data-id="${post.id}"]`);
    if (!postElement) return;

    const likeButton = postElement.querySelector('.like-section button');
    likeButton.textContent = `Like (${post.likes})`;
}

// Function to add a comment to a post
function addComment(post, commentText) {
    if (!commentText) {
        alert('Please enter a comment.');
        return;
    }

    const comment = {
        text: commentText,
        timestamp: new Date().toLocaleString()
    };

    post.comments.push(comment);
    updateCommentCount(post);
    displayComments(post);
    savePostsToLocalStorage(); // Save posts to local storage after adding a comment
}

// Function to update comment count
function updateCommentCount(post) {
    const postElement = document.querySelector(`.post[data-id="${post.id}"]`);
    if (!postElement) return;

    const commentCount = postElement.querySelector('.comment-section span');
    commentCount.textContent = `Comments (${post.comments.length})`;
}

// Function to display comments
function displayComments(post) {
    const postElement = document.querySelector(`.post[data-id="${post.id}"]`);
    if (!postElement) return;

    const commentList = postElement.querySelector('.comment-section ul');
    commentList.innerHTML = '';

    post.comments.forEach(comment => {
        const listItem = document.createElement('li');
        listItem.textContent = `${comment.text} - ${comment.timestamp}`;
        commentList.appendChild(listItem);
    });
}

// Function to save posts to local storage
function savePostsToLocalStorage() {
    localStorage.setItem('posts', JSON.stringify(posts));
}
