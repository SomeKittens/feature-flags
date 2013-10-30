# Feature Flags
### PRE-ALPHA.  USE WITH CAUTION.  Or not, I'm a readme, not a cop.
### Honestly, I'm just pushing this to GitHub now so I can show it off to the SO JS chat.

This module lets developers set user levels and restrict access to features based on said levels.  It also provides a web interface to customize those levels without pushing additional code or restarting the server.  Currently, Feature Flags only supports restriction by url.

# How-to

## The code

**ALL OF THIS IS VERY SUBJECT TO CHANGE**

You know those weird bits of code that go something like this?

    app.get('/', routes.index);

Boring as all get out.  Spice up your file with a little Feature flags:

    var ff = require('feature-flags');

Now that the life of the party's here, switch out those silly strings for some *FUNCTIONS*!

    app.get(ff.requireLevel('admin', '/'), routes.index);

Now we're talking.  Notice the two parameters.  The first is the level required (`'admin'`), the second is the path (`'/'`).  Here, we're only allowing admins at root.  Hardcore.

Now, you'll need to let Feature Flags actually route some things around, or else it'll get angry.  To pacify Feature Flags, add the following to `app.configure` call (you did require it?):

		app.use(ff.init());

## Now what?

Feature Flags will check against `req.user.auth` if `req.user` is defined, and `req.session.auth` if it isn't.  If there aren't any sessions, Feature Flags will crash horribly.  Future plans: make it crash less horribly.

You'll need to fill that property with one of `anon`, `login`, `pants`, `admin`.  How you do it is up to you.  Again, pre-alpha.  In the future you'll be able to configure the levels and save yourself from the embarrassment of assigning `pants` as your sysadmin's role.  (Looks like I'll be adding custom config in the next release, 0.0.3)

# Requirements

You'll need MongoDB on your localhost, and your app needs to run express.

This is the pre-alpha release, so expect these requirements to loosen in the future.  If you've got a particular configuration you'd like me to support, open an issue.

## TODO

### short term
 - Write tests for locals
 - Store changes made from admin panel in database
 - Figure out when/where it crashes, and harden against that
 - Fix the admin panel (0.0.2 broke it)
 - Improve UI of admin panel
 - Cleaner running of tests
### long term
 - script that writes tests based on config file
 - Percentage rollouts
 - Manually rollout
 - Automatically scale
 - Email users on rollout
 - Work with nginx

# License

Feature Flags is released under MIT.

Todo:

 - Tests
 - Documentation
 - load config defaults
 - ff.jade (moreso)
 - Simple find-and-replace script to allow for easy upgrade
 - Allow only a certian % of users in