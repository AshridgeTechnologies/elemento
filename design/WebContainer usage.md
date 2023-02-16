WebContainer usage
==================

Aims
----

- Simplify studio code
- Make preview more like live running

Issues
------

- Whether to run from source or code in preview, GitHub and deployment
- What is the best way to manage releases when running from GitHub?


Forces
------

- Should GitHub be used for artifacts (generated code)?
- Any problem in getting from GitHub the source for editing and the generated code for running?
- May want to do more complex bundling of generated code in future
- Already have an action for deploy from GitHub
- How fast can you build the code in GitHub?
- Already build files for GitHub deploy
- Want initial preview build to include everything, but only changed files after that

Decisions
---------

- Use same builder for preview and deploy


Using GitHub with WebContainers
-------------------------------

- Awkward snag: with the cross-origin isolation headers that WebContainer requires, cannot use OAuth, so cannot sign in to GitHub
- Can create a popup window without the headers, but on same origin, so can have access to same project store
- But no communication possible between the main window and the popup, so if change the project in the popup, can't directly communicate
- Makes the UI a bit harder to get right
- Would also be good to reuse the dialogs already developed
- And this may be temporary, as the Chrome devs are working on solutions
- Approach:
    - Studio opens a popup, sending action as a query param, project name and an editor id
    - Popup handles sign-in, shows dialogs and performs GitHub actions
    - Popup may set a message in local storage with a key including the editor id, to open or reload project
    - Studio listens for focus event, if has created a window, checks for message in local storage

Using Firebase with WebContainers
----------------------------------

- Could load Firebase config into preview server easily, as in deployment
- Problem is how or where to get it
