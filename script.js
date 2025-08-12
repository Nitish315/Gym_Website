// Initialize Lucide icons
lucide.createIcons();

// --- Global Variables and Utility Functions ---
const authModal = document.getElementById('auth-modal');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const authModalTitle = document.getElementById('auth-modal-title');
const showRegisterBtn = document.getElementById('show-register');
const showLoginBtn = document.getElementById('show-login');
const navAuthBtn = document.getElementById('nav-auth');
const navLogoutBtn = document.getElementById('nav-logout');
const navMyBookingsBtn = document.getElementById('nav-my-bookings');
const mobileNavAuthBtn = document.getElementById('mobile-nav-auth');
const mobileNavLogoutBtn = document.getElementById('mobile-nav-logout');
const mobileNavMyBookingsBtn = document.getElementById('mobile-nav-my-bookings');
const loginErrorMessage = document.getElementById('login-error-message');
const registerErrorMessage = document.getElementById('register-error-message');
const myBookingsSection = document.getElementById('my-bookings');
const myBookingsList = document.getElementById('my-bookings-list');
const noBookingsMessage = document.getElementById('no-bookings-message');

const messageModal = document.getElementById('message-modal');
const messageModalTitle = document.getElementById('message-modal-title');
const messageModalBody = document.getElementById('message-modal-body');
const closeMessageModalBtn = document.getElementById('message-modal-close-btn');

// Function to show a custom message modal
function showMessageModal(title, message) {
    messageModalTitle.textContent = title;
    messageModalBody.textContent = message;
    messageModal.style.display = 'flex';
}

// Function to close any modal
function closeModal(modalElement) {
    modalElement.style.display = 'none';
}

// Close buttons for modals
document.getElementById('close-auth-modal').onclick = () => closeModal(authModal);
document.getElementById('close-message-modal').onclick = () => closeModal(messageModal);
closeMessageModalBtn.onclick = () => closeModal(messageModal);

// Close modal when clicking outside of content
window.onclick = function(event) {
    if (event.target == authModal) {
        closeModal(authModal);
    }
    if (event.target == messageModal) {
        closeModal(messageModal);
    }
}

// --- Client-Side "Backend" (localStorage Management) ---

// Get all users from localStorage
function getAllUsers() {
    return JSON.parse(localStorage.getItem('alfaFitnessUsers')) || [];
}

// Save users to localStorage
function saveUsers(users) {
    localStorage.setItem('alfaFitnessUsers', JSON.stringify(users));
}

// Get current logged-in user
function getLoggedInUser() {
    return JSON.parse(localStorage.getItem('alfaFitnessLoggedInUser'));
}

// Set logged-in user
function setLoggedInUser(user) {
    localStorage.setItem('alfaFitnessLoggedInUser', JSON.stringify(user));
    updateAuthUI();
    renderMyBookings(); // Re-render bookings when login state changes
}

// Clear logged-in user
function clearLoggedInUser() {
    localStorage.removeItem('alfaFitnessLoggedInUser');
    updateAuthUI();
    renderMyBookings(); // Clear bookings display
}

// Get all bookings
function getAllBookings() {
    return JSON.parse(localStorage.getItem('alfaFitnessBookings')) || [];
}

// Save bookings
function saveBookings(bookings) {
    localStorage.setItem('alfaFitnessBookings', JSON.stringify(bookings));
}

// Add a new booking
function addBooking(booking) {
    const bookings = getAllBookings();
    bookings.push(booking);
    saveBookings(bookings);
}

// --- Authentication UI Logic ---

// Function to update header UI based on login status
function updateAuthUI() {
    const loggedInUser = getLoggedInUser();
    if (loggedInUser) {
        navAuthBtn.classList.add('hidden');
        mobileNavAuthBtn.classList.add('hidden');
        navLogoutBtn.classList.remove('hidden');
        mobileNavLogoutBtn.classList.remove('hidden');
        navMyBookingsBtn.classList.remove('hidden');
        mobileNavMyBookingsBtn.classList.remove('hidden');
        myBookingsSection.classList.remove('hidden');
    } else {
        navAuthBtn.classList.remove('hidden');
        mobileNavAuthBtn.classList.remove('hidden');
        navLogoutBtn.classList.add('hidden');
        mobileNavLogoutBtn.classList.add('hidden');
        navMyBookingsBtn.classList.add('hidden');
        mobileNavMyBookingsBtn.classList.add('hidden');
        myBookingsSection.classList.add('hidden');
    }
}

// Show Login Form
showLoginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    authModalTitle.textContent = 'Login';
    loginErrorMessage.classList.add('hidden');
    registerErrorMessage.classList.add('hidden');
});

// Show Register Form
showRegisterBtn.addEventListener('click', (e) => {
    e.preventDefault();
    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    authModalTitle.textContent = 'Register';
    loginErrorMessage.classList.add('hidden');
    registerErrorMessage.classList.add('hidden');
});

// Open Auth Modal
navAuthBtn.addEventListener('click', (e) => {
    e.preventDefault();
    authModal.style.display = 'flex';
    // Default to login form when opening
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    authModalTitle.textContent = 'Login';
    loginErrorMessage.classList.add('hidden');
    registerErrorMessage.classList.add('hidden');
});
mobileNavAuthBtn.addEventListener('click', (e) => {
    e.preventDefault();
    authModal.style.display = 'flex';
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    authModalTitle.textContent = 'Login';
    loginErrorMessage.classList.add('hidden');
    registerErrorMessage.classList.add('hidden');
    document.getElementById('mobile-menu').classList.add('hidden'); // Close mobile menu
});

// Login Logic
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const users = getAllUsers();
    const user = users.find(u => u.username === username && u.password === password); // Using plain password for demo
    if (user) {
        setLoggedInUser(user);
        closeModal(authModal);
        showMessageModal('Success', `Welcome back, ${user.username}!`);
        loginErrorMessage.classList.add('hidden');
    } else {
        loginErrorMessage.textContent = 'Invalid username or password.';
        loginErrorMessage.classList.remove('hidden');
    }
});

// Register Logic
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;

    if (password !== confirmPassword) {
        registerErrorMessage.textContent = 'Passwords do not match.';
        registerErrorMessage.classList.remove('hidden');
        return;
    }

    const users = getAllUsers();
    if (users.some(u => u.username === username)) {
        registerErrorMessage.textContent = 'Username already exists. Please choose another.';
        registerErrorMessage.classList.remove('hidden');
        return;
    }

    const newUser = { username, password }; // Storing plain password for demo
    users.push(newUser);
    saveUsers(users);
    setLoggedInUser(newUser); // Log in new user automatically
    closeModal(authModal);
    showMessageModal('Success', `Account created and logged in! Welcome, ${username}!`);
    registerErrorMessage.classList.add('hidden');
});

// Logout Logic
navLogoutBtn.addEventListener('click', () => {
    clearLoggedInUser();
    showMessageModal('Logged Out', 'You have been successfully logged out.');
});
mobileNavLogoutBtn.addEventListener('click', () => {
    clearLoggedInUser();
    showMessageModal('Logged Out', 'You have been successfully logged out.');
    document.getElementById('mobile-menu').classList.add('hidden'); // Close mobile menu
});

// --- Mobile Menu Toggle ---
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');

mobileMenuButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
});

// Close mobile menu when a navigation link is clicked
mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
    });
});

// --- Smooth Scrolling for Navigation ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// --- Dynamic Content: Classes Section ---
const classesData = [
    { id: 'yoga-flow', name: 'Yoga Flow', description: 'Find your inner peace and improve flexibility with our Vinyasa Flow class.', schedule: 'Mon, Wed, Fri - 9:00 AM', category: 'flexibility', image: 'https://placehold.co/400x250/e44d26/fff?text=Yoga' },
    { id: 'crossfit-intensity', name: 'CrossFit Intensity', description: 'High-intensity functional movements to build strength and endurance.', schedule: 'Tue, Thu - 6:00 PM', category: 'strength', image: 'https://placehold.co/400x250/e44d26/fff?text=CrossFit' },
    { id: 'spin-mania', name: 'Spin Mania', description: 'Ride through virtual terrains in this high-energy indoor cycling class.', schedule: 'Mon, Wed - 7:00 AM', category: 'cardio', image: 'https://placehold.co/400x250/e44d26/fff?text=Spin' },
    { id: 'strength-circuit', name: 'Strength Circuit', description: 'Full-body strength training using various equipment and bodyweight exercises.', schedule: 'Tue, Thu - 10:00 AM', category: 'strength', image: 'https://placehold.co/400x250/e44d26/fff?text=Strength' },
    { id: 'zumba-dance', name: 'Zumba Dance Party', description: 'Dance your way to fitness with this exhilarating and fun Latin-inspired workout.', schedule: 'Fri - 5:00 PM', category: 'dance', image: 'https://placehold.co/400x250/e44d26/fff?text=Zumba' },
    { id: 'hiit-blast', name: 'HIIT Blast', description: 'Short, intense bursts of exercise followed by brief recovery periods for maximum fat burn.', schedule: 'Mon, Thu - 12:00 PM', category: 'cardio', image: 'https://placehold.co/400x250/e44d26/fff?text=HIIT' },
];
const classesContainer = document.getElementById('classes-container');

// Function to render classes based on category
function renderClasses(category = 'all') {
    classesContainer.innerHTML = ''; // Clear previous classes
    const filteredClasses = category === 'all' ? classesData : classesData.filter(c => c.category === category);

    filteredClasses.forEach(c => {
        const classCard = document.createElement('div');
        classCard.classList.add('bg-gray-800', 'rounded-lg', 'shadow-xl', 'p-6', 'flex', 'flex-col', 'transform', 'hover:scale-105', 'transition', 'duration-300');
        classCard.innerHTML = `
            <img src="${c.image}" alt="${c.name}" class="w-full h-48 object-cover rounded-lg mb-4">
            <h3 class="text-2xl font-bold mb-2 text-red-500">${c.name}</h3>
            <p class="text-gray-300 mb-3 flex-grow">${c.description}</p>
            <p class="text-gray-400 text-sm mb-4"><strong>Schedule:</strong> ${c.schedule}</p>
            <button class="book-class-btn bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-full text-lg transition duration-300 shadow-lg mt-auto"
                data-class-id="${c.id}" data-class-name="${c.name}">
                Book Now
            </button>
        `;
        classesContainer.appendChild(classCard);
    });

    // Attach event listeners to newly created "Book Now" buttons
    document.querySelectorAll('.book-class-btn').forEach(button => {
        button.addEventListener('click', handleClassBooking);
    });
}

// Handle class booking
function handleClassBooking(e) {
    const loggedInUser = getLoggedInUser();
    if (!loggedInUser) {
        showMessageModal('Login Required', 'Please log in to book a class.');
        return;
    }

    const classId = e.target.dataset.classId;
    const className = e.target.dataset.className;
    const bookingDate = new Date().toLocaleDateString('en-IN', {day: '2-digit', month: '2-digit', year: 'numeric'}); // Ensure consistent date format

    const booking = {
        userId: loggedInUser.username, // Using username as ID for simplicity
        classId: classId,
        className: className,
        bookingDate: bookingDate
    };

    addBooking(booking);
    showMessageModal('Booking Confirmed!', `You have successfully booked "${className}" for ${bookingDate}.`);
    renderMyBookings(); // Update my bookings section
}

// Event listeners for class filters
document.querySelectorAll('.filter-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('bg-red-600', 'text-white'));
        e.target.classList.add('bg-red-600', 'text-white');
        renderClasses(e.target.dataset.category);
    });
});

// --- Render My Bookings Section ---
function renderMyBookings() {
    const loggedInUser = getLoggedInUser();
    myBookingsList.innerHTML = ''; // Clear previous list
    noBookingsMessage.classList.add('hidden'); // Hide default message

    if (!loggedInUser) {
        myBookingsList.innerHTML = '<p class="text-gray-400 text-center">Please log in to view your bookings.</p>';
        return;
    }

    const allBookings = getAllBookings();
    const userBookings = allBookings.filter(b => b.userId === loggedInUser.username);

    if (userBookings.length === 0) {
        noBookingsMessage.classList.remove('hidden');
        myBookingsList.appendChild(noBookingsMessage);
    } else {
        userBookings.forEach(booking => {
            const bookingItem = document.createElement('div');
            bookingItem.classList.add('bg-gray-700', 'p-4', 'rounded-lg', 'mb-3', 'flex', 'justify-between', 'items-center', 'shadow');
            bookingItem.innerHTML = `
                <div>
                    <p class="text-xl font-semibold text-white">${booking.className}</p>
                    <p class="text-gray-400 text-sm">Booked on: ${booking.bookingDate}</p>
                </div>
                <button class="cancel-booking-btn bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-full text-sm transition duration-300"
                    data-class-id="${booking.classId}" data-booking-date="${booking.bookingDate}">
                    Cancel
                </button>
            `;
            myBookingsList.appendChild(bookingItem);
        });

        // Attach cancel booking listeners
        document.querySelectorAll('.cancel-booking-btn').forEach(button => {
            button.addEventListener('click', handleCancelBooking);
        });
    }
}

// Handle canceling a booking
function handleCancelBooking(e) {
    const loggedInUser = getLoggedInUser();
    if (!loggedInUser) return; // Should not happen if UI is correct

    const classIdToCancel = e.target.dataset.classId;
    const bookingDateToCancel = e.target.dataset.bookingDate;

    let allBookings = getAllBookings();
    const initialLength = allBookings.length;

    // Filter out the specific booking for the current user
    allBookings = allBookings.filter(b =>
        !(b.userId === loggedInUser.username &&
          b.classId === classIdToCancel &&
          b.bookingDate === bookingDateToCancel)
    );

    if (allBookings.length < initialLength) {
        saveBookings(allBookings);
        showMessageModal('Booking Canceled', `Your booking for "${classesData.find(c => c.id === classIdToCancel)?.name || classIdToCancel}" has been canceled.`);
        renderMyBookings(); // Re-render the list
    } else {
        showMessageModal('Error', 'Could not find booking to cancel.');
    }
}

// --- Contact Form Validation ---
const contactForm = document.getElementById('contact-form');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const subjectInput = document.getElementById('subject');
const messageInput = document.getElementById('message');

const nameError = document.getElementById('name-error');
const emailError = document.getElementById('email-error');
const subjectError = document.getElementById('subject-error');
const messageError = document.getElementById('message-error');

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    // Validate Name
    if (nameInput.value.trim() === '') {
        nameError.classList.remove('hidden');
        isValid = false;
    } else {
        nameError.classList.add('hidden');
    }

    // Validate Email
    if (!validateEmail(emailInput.value.trim())) {
        emailError.classList.remove('hidden');
        isValid = false;
    } else {
        emailError.classList.add('hidden');
    }

    // Validate Subject
    if (subjectInput.value.trim() === '') {
        subjectError.classList.remove('hidden');
        isValid = false;
    } else {
        subjectError.classList.add('hidden');
    }

    // Validate Message
    if (messageInput.value.trim() === '') {
        messageError.classList.remove('hidden');
        isValid = false;
    } else {
        messageError.classList.add('hidden');
    }

    if (isValid) {
        showMessageModal('Message Sent!', 'Thank you for your message. We will get back to you soon!');
        contactForm.reset(); // Clear the form
    }
});

// --- Testimonial Carousel ---
const testimonialsData = [
    { quote: "Alfa Fitness has transformed my life! The trainers are amazing and the classes are so motivating. Highly recommend!", name: "Sarah J." },
    { quote: "Never thought I'd enjoy working out, but Alfa Fitness made it fun. The community here is incredibly supportive.", name: "David L." },
    { quote: "The best gym experience I've had. Clean facilities, diverse classes, and knowledgeable trainers. Truly a top-notch place!", name: "Emily R." },
    { quote: "I've achieved goals I never thought possible. Alfa Fitness provides everything you need for a successful fitness journey.", name: "Mark T." },
];

const carouselInner = document.getElementById('carousel-inner');
const prevTestimonialBtn = document.getElementById('prev-testimonial');
const nextTestimonialBtn = document.getElementById('next-testimonial');
let currentIndex = 0;

function renderTestimonials() {
    carouselInner.innerHTML = '';
    testimonialsData.forEach(testimonial => {
        const testimonialItem = document.createElement('div');
        testimonialItem.classList.add('flex-none', 'w-full', 'p-4', 'text-center');
        testimonialItem.innerHTML = `
            <p class="text-xl md:text-2xl italic text-gray-200 mb-6">"${testimonial.quote}"</p>
            <p class="text-lg font-semibold text-red-400">- ${testimonial.name}</p>
        `;
        carouselInner.appendChild(testimonialItem);
    });
    updateCarousel();
}

function updateCarousel() {
    // Check if carouselInner has children before trying to access clientWidth
    if (carouselInner.children.length > 0) {
        const itemWidth = carouselInner.children[0].clientWidth;
        carouselInner.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
    }
}

prevTestimonialBtn.addEventListener('click', () => {
    currentIndex = (currentIndex > 0) ? currentIndex - 1 : testimonialsData.length - 1;
    updateCarousel();
});

nextTestimonialBtn.addEventListener('click', () => {
    currentIndex = (currentIndex < testimonialsData.length - 1) ? currentIndex + 1 : 0;
    updateCarousel();
});

// Auto-advance carousel
let carouselInterval;
function startCarouselAutoAdvance() {
    if (carouselInterval) clearInterval(carouselInterval); // Clear any existing interval
    carouselInterval = setInterval(() => {
        currentIndex = (currentIndex < testimonialsData.length - 1) ? currentIndex + 1 : 0;
        updateCarousel();
    }, 5000); // Change slide every 5 seconds
}


// Adjust carousel on window resize
window.addEventListener('resize', updateCarousel);


// --- Pricing Section Button Clicks ---
document.querySelectorAll('.choose-plan-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        const planName = e.target.textContent.replace('Choose ', '');
        showMessageModal('Plan Selected!', `You have chosen the ${planName} Plan. A representative will contact you shortly!`);
    });
});

// --- Initial Load Logic ---
document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();        // Update UI based on initial login state
    renderClasses();       // Render all classes initially
    renderTestimonials();  // Render testimonials
    renderMyBookings();    // Render user's bookings
    startCarouselAutoAdvance(); // Start auto-advance after testimonials are rendered
    lucide.createIcons();  // Ensure icons are rendered
});