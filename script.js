document.addEventListener('DOMContentLoaded', function() {
  // Theme toggle functionality
  const themeToggle = document.getElementById('themeToggle');
  const root = document.documentElement;
  
  // Define light theme variables
  const lightTheme = {
    '--primary-dark': '#f5f5f7',
    '--secondary-dark': '#ffffff',
    '--accent-dark': '#e0e0e6',
    '--text-primary': '#333344',
    '--text-secondary': '#4169e1',
    '--accent-color': '#8a6cbd',
    '--shadow-color': 'rgba(0, 0, 0, 0.1)'
  };
  
  // Original dark theme saved for reference
  const darkTheme = {
    '--primary-dark': '#1a1b26',
    '--secondary-dark': '#24283b',
    '--accent-dark': '#414868',
    '--text-primary': '#a9b1d6',
    '--text-secondary': '#7aa2f7',
    '--accent-color': '#bb9af7',
    '--shadow-color': 'rgba(0, 0, 0, 0.4)'
  };
  
  // Check if theme preference is stored
  let currentTheme = localStorage.getItem('theme') || 'dark';
  if (currentTheme === 'light') {
    applyTheme(lightTheme);
    themeToggle.textContent = 'Dark Mode';
  } else {
    themeToggle.textContent = 'Light Mode';
  }
  
  themeToggle.addEventListener('click', function() {
    if (currentTheme === 'dark') {
      applyTheme(lightTheme);
      currentTheme = 'light';
      themeToggle.textContent = 'Dark Mode';
    } else {
      applyTheme(darkTheme);
      currentTheme = 'dark';
      themeToggle.textContent = 'Light Mode';
    }
    localStorage.setItem('theme', currentTheme);
  });
  
  function applyTheme(theme) {
    for (const [property, value] of Object.entries(theme)) {
      root.style.setProperty(property, value);
    }
  }
  
  // File upload functionality
  const uploadContainer = document.getElementById('uploadContainer');
  const fileUpload = document.getElementById('fileUpload');
  
  uploadContainer.addEventListener('click', function() {
    fileUpload.click();
  });
  
  uploadContainer.addEventListener('dragover', function(e) {
    e.preventDefault();
    uploadContainer.style.borderColor = 'var(--accent-color)';
    uploadContainer.style.backgroundColor = 'rgba(187, 154, 247, 0.2)';
  });
  
  uploadContainer.addEventListener('dragleave', function() {
    uploadContainer.style.borderColor = '';
    uploadContainer.style.backgroundColor = '';
  });
  
  uploadContainer.addEventListener('drop', function(e) {
    e.preventDefault();
    uploadContainer.style.borderColor = '';
    uploadContainer.style.backgroundColor = '';
    
    const files = e.dataTransfer.files;
    handleFiles(files);
  });
  
  fileUpload.addEventListener('change', function() {
    handleFiles(this.files);
  });
  
  // Link input functionality
  const linkInput = document.getElementById('linkInput');
  const addLinkBtn = document.getElementById('addLinkBtn');
  
  addLinkBtn.addEventListener('click', function() {
    const link = linkInput.value.trim();
    if (link) {
      addAssignment({
        type: 'link',
        name: getFilenameFromUrl(link),
        url: link,
        size: 'External Link',
        date: new Date()
      });
      linkInput.value = '';
    }
  });
  
  // Handle Enter key in link input
  linkInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      addLinkBtn.click();
    }
  });
  
  // Assignment list functionality
  const assignmentsList = document.getElementById('assignmentsList');
  let assignments = JSON.parse(localStorage.getItem('assignments')) || [];
  
  // Load existing assignments
  assignments.forEach(assignment => {
    createAssignmentCard(assignment);
  });
  
  function handleFiles(files) {
    Array.from(files).forEach(file => {
      const assignment = {
        type: 'file',
        name: file.name,
        size: formatFileSize(file.size),
        date: new Date(),
        // In a real app, you'd upload the file to a server
        // and store the URL here
        data: URL.createObjectURL(file)
      };
      
      addAssignment(assignment);
    });
  }
  
  function addAssignment(assignment) {
    assignments.push(assignment);
    localStorage.setItem('assignments', JSON.stringify(assignments));
    createAssignmentCard(assignment);
  }
  
  function createAssignmentCard(assignment) {
    const card = document.createElement('div');
    card.className = 'assignment-card';
    card.dataset.index = assignments.indexOf(assignment);
    
    const dateStr = new Date(assignment.date).toLocaleDateString();
    
    card.innerHTML = `
      <h3>${assignment.name}</h3>
      <div class="file-info">
        <p>${assignment.size}</p>
        <p>${dateStr}</p>
      </div>
      <div class="file-actions">
        <button class="grade-btn">Grade</button>
        <button class="delete-btn">Delete</button>
      </div>
      <div class="grade-dropdown">
        <button data-grade="A">A (Excellent)</button>
        <button data-grade="B">B (Good)</button>
        <button data-grade="C">C (Average)</button>
        <button data-grade="D">D (Below Average)</button>
        <button data-grade="F">F (Fail)</button>
      </div>
    `;
    
    assignmentsList.appendChild(card);
    
    // Add event listeners to the new card
    const deleteBtn = card.querySelector('.delete-btn');
    const gradeBtn = card.querySelector('.grade-btn');
    const gradeDropdown = card.querySelector('.grade-dropdown');
    const gradeOptions = card.querySelectorAll('.grade-dropdown button');
    
    deleteBtn.addEventListener('click', function() {
      const index = parseInt(card.dataset.index);
      assignments.splice(index, 1);
      localStorage.setItem('assignments', JSON.stringify(assignments));
      card.remove();
      // Update indices for remaining cards
      updateCardIndices();
    });
    
    gradeBtn.addEventListener('click', function() {
      gradeDropdown.classList.toggle('show');
    });
    
    gradeOptions.forEach(option => {
      option.addEventListener('click', function() {
        const grade = this.dataset.grade;
        const index = parseInt(card.dataset.index);
        assignments[index].grade = grade;
        localStorage.setItem('assignments', JSON.stringify(assignments));
        
        // Show congratulations animation
        const congratsOverlay = document.getElementById('congratsOverlay');
        congratsOverlay.classList.add('show');
        
        setTimeout(() => {
          congratsOverlay.classList.remove('show');
        }, 3000);
        
        // Add a visual indicator of the grade on the card
        if (card.querySelector('.grade-indicator')) {
          card.querySelector('.grade-indicator').remove();
        }
        
        const gradeIndicator = document.createElement('div');
        gradeIndicator.className = 'grade-indicator';
        gradeIndicator.style.position = 'absolute';
        gradeIndicator.style.top = '15px';
        gradeIndicator.style.right = '15px';
        gradeIndicator.style.padding = '5px 10px';
        gradeIndicator.style.borderRadius = '50%';
        gradeIndicator.style.backgroundColor = getGradeColor(grade);
        gradeIndicator.style.color = '#fff';
        gradeIndicator.style.fontWeight = 'bold';
        gradeIndicator.textContent = grade;
        
        card.appendChild(gradeIndicator);
        gradeDropdown.classList.remove('show');
      });
    });
  }
  
  function updateCardIndices() {
    const cards = document.querySelectorAll('.assignment-card');
    cards.forEach((card, index) => {
      card.dataset.index = index;
    });
  }
  
  function getGradeColor(grade) {
    const colors = {
      'A': 'var(--success-color)',
      'B': '#4caf50',
      'C': 'var(--warning-color)',
      'D': '#ff9800',
      'F': 'var(--danger-color)'
    };
    return colors[grade] || 'var(--accent-color)';
  }
  
  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  function getFilenameFromUrl(url) {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      let filename = pathname.substring(pathname.lastIndexOf('/') + 1);
      
      // If no filename is found, use the hostname
      if (!filename || filename === '') {
        filename = urlObj.hostname;
      }
      
      return decodeURIComponent(filename) || 'External Link';
    } catch (e) {
      return url.substring(0, 30) + '...';
    }
  }
  
  // Comments section functionality
  const commentsList = document.getElementById('commentsList');
  const commenterName = document.getElementById('commenterName');
  const commentText = document.getElementById('commentText');
  const addCommentBtn = document.getElementById('addCommentBtn');
  
  // Load existing comments
  let comments = JSON.parse(localStorage.getItem('comments')) || [];
  
  // Display saved comments
  comments.forEach(comment => {
    createCommentCard(comment);
  });
  
  addCommentBtn.addEventListener('click', function() {
    const name = commenterName.value.trim();
    const text = commentText.value.trim();
    
    if (name && text) {
      const comment = {
        name: name,
        text: text,
        date: new Date()
      };
      
      comments.push(comment);
      localStorage.setItem('comments', JSON.stringify(comments));
      
      createCommentCard(comment);
      
      // Clear inputs
      commenterName.value = '';
      commentText.value = '';
    }
  });
  
  function createCommentCard(comment) {
    const card = document.createElement('div');
    card.className = 'comment-card';
    
    const date = new Date(comment.date);
    const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    card.innerHTML = `
      <div class="comment-header">
        <h4>${comment.name}</h4>
        <small>${dateStr}</small>
      </div>
      <p class="comment-text">${comment.text}</p>
    `;
    
    commentsList.appendChild(card);
    
    // Scroll to the bottom of comments list
    commentsList.scrollTop = commentsList.scrollHeight;
  }
  
  // Close grade dropdown when clicking outside
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.grade-btn') && !e.target.closest('.grade-dropdown')) {
      const dropdowns = document.querySelectorAll('.grade-dropdown.show');
      dropdowns.forEach(dropdown => {
        dropdown.classList.remove('show');
      });
    }
  });
});
