---
title: Dynamic Meta Descriptions in WordPress
created: 2025-02-22
updated: 2025-02-22
tags:
  - web-development
  - wordpress
---

In a WordPress theme, the `<head>` element goes in the `header.php` template, which you can then include in your pages using `get_header()`. But anything you hard-code in there will be the same for every page. Not going to work for `<meta>` descriptions.

To dynamically generate page `<meta>` descriptions in WordPress, you'll need to add two functions to your `functions.php` file:

```php
function dynamic_meta_description() {
    // Check if we are viewing a single post or page
    if ( is_singular() ) {
        global $post; // Access the global $post object
        
        // Use the post excerpt if available, otherwise trim the first 55 words of the content
        $description = $post->post_excerpt ? $post->post_excerpt : wp_trim_words( $post->post_content, 55, '' );
    } else {
        // For other pages (home, archives, etc.), use the site's tagline from WordPress settings
        $description = get_bloginfo('description');
    }
    
    // Output the meta description tag in the head section of the page
    echo '<meta name="description" content="' . esc_attr($description) . '">' . "\n";
}
```

```php
function enable_page_excerpts() {
  // Enable support for excerpts on WordPress pages
  // By default, excerpts are only available for posts
  add_post_type_support('page', 'excerpt');
}
```

The first function does the following:

1. Check if the current page is a single post or page.
2. Use `is_singular()` to determine if the visitor is viewing an individual post or page.
3. If it's a single post or page, access the global `$post` object, which contains the current post's data.
4. Check if the post has an excerpt.
5. If an excerpt exists, use it as the meta description.
6. If no excerpt is set, take the first 55 words from the post content.
7. If it's not a single post or page, retrieve the site's tagline as the meta description.
8. Output the meta description tag inside the `<head>` section.

To apply this functionality, hook it into WordPress using the `wp_head` action:

```php
// Hook the function into the wp_head action to insert the meta description in the head
add_action( 'wp_head', 'dynamic_meta_description' );
```

WordPress has built-in support for excerpts, but only for posts by default. The second function tells WordPress that pages (not just posts) should also support excerpts.

To enable this function, add the following lines to `functions.php`:

```php
add_action('init', 'enable_page_excerpts');
```

You can now go to your WordPress admin and see a new "Excerpt" box in the editor for pages. WordPress will take any text in this box for the page's `<meta>` description.
