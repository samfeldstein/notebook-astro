---
title: Build a Wordpress Contact Form
tags:
  - web-development
  - wordpress
created: 2025-02-24
updated: 2025-02-25
---

To add a simple contact form to your WordPress site, drop this code into a `contact.php` file, or wherever you want the form to appear.

```php
<form class="contact" action="<?php echo esc_url(admin_url('admin-post.php')); ?>" method="post">

// Input for sender's name
<label for="name">Name</label>
<input type="text" id="name" name="name" placeholder="Name" autocomplete="true" required>

// Input for sender's email
<label for="email">Email</label>
<input type="email" id="email" name="email" placeholder="Email" autocomplete="true" required>

// Text area for sender's message
<label for="message">Message</label>
<textarea id="message" name="message" placeholder="Message" required></textarea>

// Security token to prevent CSRF attacks
<?php wp_nonce_field('contact_form_submit'); ?>

// Hidden field to identify the form action in the backend
<input type="hidden" name="action" value="contact_form_submission">

// Submit button
<button type="submit">Send</button>

</form>
```

`action="<?php echo esc_url(admin_url('admin-post.php')); ?>"` sets the form's action URL to `admin-post.php`, a special WordPress file that handles form submissions. `esc_url(...)` sanitizes the URL to make sure it's properly formatted and valid.

`wp_nonce_field('contact_form_submit');` is another security measure. It adds a hidden security token (nonce) to protect against Cross-Site Request Forgery (CSRF) attacks. WordPress verifies this token when the form is submitted. If it's missing or incorrect, the form is rejected.

`<input type="hidden" name="action" value="contact_form_submission">` helps the WordPress backend identify the purpose of the form submission. When the form is processed in `admin-post.php`, the value `"contact_form_submission"` is used to determine what action to take.

## Process the form

Now that we've written our form, we have to tell WordPress what to do with the submitted data.

Add this code to your `functions.php` file:

```php
// Create and name the function
function handle_contact_form() {

// Check if the nonce is valid. If the nonce is missing or invalid, stop execution and show an error message
if (!wp_verify_nonce($_POST['_wpnonce'], 'contact_form_submit')) {

wp_die('Invalid nonce');
}

// Create variables for sender name, email, and message
$name = sanitize_text_field($_POST['name']);
$email = sanitize_email($_POST['email']);
$message = sanitize_textarea_field($_POST['message']);

// Create some variables for the receiver's email, the subject line, and the email message body
$to = get_option('admin_email');
$subject = 'New Contact Form Submission';
$body = "Name: $name\nEmail: $email\nMessage: $message";

// Send the email
wp_mail($to, $subject, $body);

// Redirect to a success page
wp_redirect(home_url('/success/'));
exit;
}
```

To enable the function, add these lines to `functions.php`:

```php
add_action('admin_post_nopriv_contact_form_submission', 'handle_contact_form');
add_action('admin_post_contact_form_submission', 'handle_contact_form');
```

## Configure the server

The last thing we need to do is configure the server to send emails. We can do this with an **SMTP plugin**. An SMTP plugin is necessary because WordPress's default email system is unreliable.

By default, WordPress uses PHP's `mail()` function to send emails. The problem is that many web hosting servers block or restrict `mail()` to prevent spam. Even if `mail()` works, emails often end up in spam folders because they lack proper authentication.

SMTP stands for Simple Mail Transfer Protocol. We can install a plugin on our site that makes WordPress send emails through a real email server instead of `mail()`. 

It makes emails look legitimate and prevents them from ending up in spam folders, and improves deliverability so emails actually end up in the target inbox.

I've used [WP Mail SMTP](https://wpmailsmtp.com/), and it seems to work great. Once you install it, you'll have to pick a mailer service. I chose Brevo because it has a free tier that includes 300 emails a month.

The setup is pretty simple. Make an account with Brevo, generate an API key, paste the key into the WP Mail plugin (under Settings>General).

Save your settings, you should be good to go.