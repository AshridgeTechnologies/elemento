Tools
=====

Aims
----

- Developers can build add-on tools for the studio
- Developers can build add-on tools for apps
- Tools can be used for help, wizards or any additional functionality

Needs
-----

- Tools can run as additional apps in the studio alongside the preview
- Tools can run inside user apps
- Tools can read from and control the editor
- Tools can read from and control running apps - preview or deployed
- Tools can be created with all the same facilities as user apps
- Tools can be shared and imported
- Multiple tools can run alongside each other in editor or deployed app
- User can show or hide any of the tools easily
- Editor can include standard tools such as Help

Forces
------

- Screen area in the editor is constrained

Possibilities
-------------

- Tools under the Project work with the editor and its current preview App
- Tools under an App work with the App
- Tools can be imported or created in the project

Decisions - 24 Jul 2023
---------

- Tutorials starts with the Tools mechanism
- All Help and Tutorials implemented as Tools


Further points - 3 Apr 2024
---------------------------

Forces
------
- Some tools are naturally outside any Project
- Help and Tutorials should be available anywhere
- Help and Tutorials should be generally online for SSO
- While using Help and Tutorials may want to create or open Projects
- May want to open a Tutorial in the middle of working on a Project
- BUT some tools will be specific to a Project
- May want to keep Tools available permanently across different projects
- May want link to Studio with a certain Tool(s) open
- May want to open Tool from a link inside the Studio (eg from Help -> Tutorials)
- May want to enter a Tool URL and open it

Decisions
-------------

- ✅ Can open a Tool or tutorial from a URL entered at the end of the Tools/Tutorials menu
- Known Tools and Tutorials are under the menus as links
- Tutorials menu accessed from Help has links to open them from a URL
- ✅ Studio URL with tool=<url> will open those tools
- Include link to open in Studio in tutorial - use wherever you open it
- ✅ Tools Menu available even if no Project open
- Keep Tools defined within a Project
- Keep Tool Imports within a Project for now


