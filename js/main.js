(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner();


    // Initiate the wowjs
    new WOW().init();


    // Sticky Navbar
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.sticky-top').addClass('shadow-sm').css('top', '0px');
        } else {
            $('.sticky-top').removeClass('shadow-sm').css('top', '-100px');
        }
    });


    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({ scrollTop: 0 }, 1500, 'easeInOutExpo');
        return false;
    });


    // Facts counter
    $('[data-toggle="counter-up"]').counterUp({
        delay: 10,
        time: 2000
    });


    // Portfolio isotope and filter
    var portfolioIsotope = $('.portfolio-container').isotope({
        itemSelector: '.portfolio-item',
        layoutMode: 'fitRows'
    });
    $('#portfolio-flters li').on('click', function () {
        $("#portfolio-flters li").removeClass('active');
        $(this).addClass('active');

        portfolioIsotope.isotope({ filter: $(this).data('filter') });
    });


    // Testimonials carousel
    $(".testimonial-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        items: 1,
        dots: false,
        loop: true,
        nav: true,
        navText: [
            '<i class="bi bi-chevron-left"></i>',
            '<i class="bi bi-chevron-right"></i>'
        ]
    });

    // Cart functionality
    function getCart() {
        const cart = localStorage.getItem('cart');
        return cart ? JSON.parse(cart) : [];
    }

    function saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    function updateCartCount() {
        const cart = getCart();
        // Sum quantities for total count
        const totalCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        $('#cart-count').text(totalCount);
    }

    function renderCartItems() {
        const cart = getCart();
        const container = $('#cartItemsContainer');
        container.empty();
        let total = 0;

        if (cart.length === 0) {
            container.html('<p>Your cart is empty.</p>');
            $('#cartTotal').text('0.00');
            return;
        }

        let tableHtml = `
            <table class="table">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Subtotal</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
        `;

        cart.forEach(item => {
            const price = parseFloat(item.price.replace('$', ''));
            const quantity = item.quantity || 1;
            const subtotal = price * quantity;
            total += subtotal;

            tableHtml += `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.price}</td>
                    <td>${quantity}</td>
                    <td>$${subtotal.toFixed(2)}</td>
                    <td><button class="btn btn-danger btn-sm remove-from-cart" data-id="${item.id}">Remove</button></td>
                </tr>
            `;
        });

        tableHtml += `
                </tbody>
            </table>
        `;

        container.html(tableHtml);
        $('#cartTotal').text(total.toFixed(2));
    }

    function addToCart(product) {
        const cart = getCart();
        const existingProductIndex = cart.findIndex(item => item.id === product.id);
        if (existingProductIndex !== -1) {
            // Increment quantity if product exists
            cart[existingProductIndex].quantity += product.quantity || 1;
        } else {
            cart.push(product);
        }
        saveCart(cart);
        updateCartCount();
    }

    function removeFromCart(productId) {
        let cart = getCart();
        cart = cart.filter(item => item.id !== productId);
        saveCart(cart);
        updateCartCount();
        renderCartItems();
    }

    // Event delegation for dynamically created buttons
    $(document).on('click', '.btn-success', function () {
        const productCard = $(this).closest('.product-card');
        const name = productCard.find('.product-name').text();
        const price = productCard.find('.text-muted').text();
        // Use data attribute for id if available, else fallback to index
        let id = productCard.data('id');
        if (!id) {
            id = parseInt(productCard.parent().index()) + 1; // Assuming order matches product id
        }
        const quantity = parseInt(productCard.find('.quantity-input').val()) || 1;

        addToCart({ id, name, price, quantity });
    });

    // Remove from cart button
    $(document).on('click', '.remove-from-cart', function () {
        const id = parseInt($(this).data('id'));
        removeFromCart(id);
    });

    // Update cart count and render cart on modal show
    $('#cartModal').on('show.bs.modal', function () {
        renderCartItems();
    });

    // Checkout button click handler
    $('#checkoutBtn').on('click', function () {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        if (!isLoggedIn) {
            // Show login first modal
            $('#cartModal').modal('hide');
            $('#loginFirstModal').modal('show');
        } else {
            // Proceed with checkout (simulate payment integration)
            alert('Redirecting to payment gateway...');
            // Here you can add real payment integration or redirect to payment page
        }
    });

    // Clear cart button click handler
    $('#clearCartBtn').on('click', function () {
        localStorage.removeItem('cart');
        updateCartCount();
        renderCartItems();
    });

    // Ensure login form is shown by default when userAuthModal is opened
    $('#userAuthModal').on('show.bs.modal', function () {
        $('#loginFormContainer').show();
        $('#signUpFormContainer').hide();
        $('#userAuthModalLabel').text('Sign In');
    });

    // Initialize cart count on page load
    $(document).ready(function () {
        // Clear cart and reset count if user not logged in
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        if (!isLoggedIn) {
            localStorage.removeItem('cart');
            $('#cart-count').text('0');
        } else {
            updateCartCount();
        }

        // Toggle to show signup form
        $('#showSignUpForm').click(function (e) {
            e.preventDefault();
            $('#loginFormContainer').hide();
            $('#signUpFormContainer').show();
            $('#userAuthModalLabel').text('Sign Up');
        });

        // Toggle to show signin form
        $('#showSignInForm').click(function (e) {
            e.preventDefault();
            $('#signUpFormContainer').hide();
            $('#loginFormContainer').show();
            $('#userAuthModalLabel').text('Sign In');
        });

        // Handle signup form submission
        $('#signUpForm').submit(function (e) {
            e.preventDefault();

            const username = $('#signUpUsername').val().trim();
            const email = $('#signUpEmail').val().trim();
            const password = $('#signUpPassword').val();
            const confirmPassword = $('#signUpConfirmPassword').val();

            if (password !== confirmPassword) {
                alert('Passwords do not match.');
                return;
            }

            const userData = {
                username: username,
                email: email,
                password: password
            };

            fetch('https://localhost:/Api', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to create account.');
                    }
                    return response.json();
                })
                .then(data => {
                    // Assuming API returns success status
                    $('#userAuthModal').modal('hide');
                    $('#signUpForm')[0].reset();
                    $('#signUpFormContainer').hide();
                    $('#loginFormContainer').show();
                    $('#userAuthModalLabel').text('Sign In');
                    $('#successPopupModal').modal('show');
                })
                .catch(error => {
                    alert(error.message);
                });
        });

        // Handle signin form submission (simulate login)
        $('#signInForm').submit(function (e) {
            e.preventDefault();
            // Simulate successful login
            localStorage.setItem('isLoggedIn', 'true');
            $('#userAuthModal').modal('hide');
            alert('Login successful. You can now proceed to checkout.');
        });

        // Close success popup modal
        $('#successPopupCloseBtn').click(function () {
            $('#successPopupModal').modal('hide');
        });
    });

})(jQuery);
const menuItems = document.querySelectorAll('.nav-link');
const currentPath = window.location.pathname.split("/").pop(); // get the current page like 'about.html'

menuItems.forEach(link => {
    // First, remove any old 'active' classes
    link.classList.remove('active');

    // Now add 'active' if href matches the current page
    if (link.getAttribute('href') === currentPath) {
        link.classList.add('active');
    }
});




