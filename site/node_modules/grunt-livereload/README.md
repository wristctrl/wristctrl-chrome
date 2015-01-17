# grunt-livereload

Refresh your CSS (or page) with each save via [LiveReload][1].


## Getting Started

First, install this grunt plugin next to your project's [grunt.js gruntfile][getting_started] with: `npm install grunt-livereload`

Second, add this line to your project's `grunt.js` gruntfile:

```javascript
grunt.loadNpmTasks('grunt-livereload');
```


## Documentation

Third, have livereload monitor changes to **browser-accessible resources**.
This part is crucial, as CSS, if specified correctly, can be reloaded without
refreshing the entire page.

```javascript
// grunt.js
{
  ...
  livereload  : {
    options   : {
      base    : 'public',
    },
    files     : ['public/**/*']
  }
  ...
}
```

In this example, `public/css/app.css` will trigger a reload of the `css/app.css` resource only,
while `public/index.html` will cause a full page refresh.

Finally, ensure your `watch` task doesn't process CSS at the same time it
processes HTML, JS, and other resources that are being monitored:

```javascript
// grunt.js
{
  watch: {
    somecss: {
      files: '**/*.css',
      tasks: ['copy:somecss']
    },
    js: {
      files: '**/*.js',
      tasks: ['concat']
    }
  }
}
```

Many people watch *everything* and run their build process each time.  This
is unecessarily slow and prevents LiveReload from being able to see when
*only the `.css` has changed*.  So, it's recommended that you watch different
*types* of files and perform only what's necessary to rebuild those.

This way, CSS is copied/processed alone and LiveReload will seamlessly replace
the styles in your page without refreshing the whole browser.

[grunt]: http://gruntjs.com/
[getting_started]: https://github.com/gruntjs/grunt/blob/master/docs/getting_started.md


## Changelog

### v0.1.3

- Grunt 0.4 support (Thanks [@xbudex](https://github.com/ericclemmons/grunt-livereload/pull/2)!)


### v0.1.2

- If `livereload` attempts to start an already-running server, it logs
  to the console rather than throwing an `err`.  (This is common when
  clearing `require.cache`)

### v0.1.1

- Refresh browser when `livereload` task is ran while server is running

### v0.1.0

- Initial release


## License

Copyright (c) 2013 Eric Clemmons
Licensed under the MIT license.


[1]: http://feedback.livereload.com/knowledgebase/articles/86242-how-do-i-install-and-use-the-browser-extensions-
