## NOTE: This Sass infrastructure is redundant, but needed in order to address an IE9 rule limit within CSS - http://blogs.msdn.com/b/ieinternals/archive/2011/05/14/10164546.aspx

// lms - css application architecture (platform)
// ====================

// libs and resets *do not edit*
@import 'bourbon/bourbon'; // lib - bourbon
@import 'vendor/bi-app/bi-app-ltr'; // set the layout for left to right languages

// BASE  *default edX offerings*
// ====================

// utilities
@import 'utilities/reset';
@import 'utilities/variables';
@import 'utilities/mixins';
@import 'utilities/extends';

## THEMING
## -------
## Set up this file to import an edX theme library if the environment
## indicates that a theme should be used. The assumption is that the
## theme resides outside of this main edX repository, in a directory
## called themes/<theme-name>/, with its base Sass file in
## themes/<theme-name>/static/sass/_<theme-name>.scss. That one entry
## point can be used to @import in as many other things as needed.
% if env["FEATURES"].get("USE_CUSTOM_THEME", False):
  // import theme's Sass overrides
  @import '${env.get('THEME_NAME')}';
% endif

// assets
@import 'assets/fonts';
@import 'assets/animations';

// elements
@import 'elements/typography';
@import 'elements/controls';
@import 'elements/system-feedback';

// base - starter
@import 'base/base';

// shared - platform
@import 'multicourse/home';
@import 'multicourse/dashboard';
@import 'multicourse/account';
@import 'multicourse/courses';
@import 'multicourse/course_about';
@import 'multicourse/jobs';
@import 'multicourse/media-kit';
@import 'multicourse/about_pages';
@import 'multicourse/press_release';
@import 'multicourse/error-pages';
@import 'multicourse/help';
@import 'multicourse/edge';
@import 'multicourse/survey-page';

@import 'developer'; // used for any developer-created scss that needs further polish/refactoring
@import 'shame';     // used for any bad-form/orphaned scss
## NOTE: needed here for cascade and dependency purposes, but not a great permanent solution
