# Still not sure what to build?

Some existing projects to get you thinking:

#list[
- #url[IMCF, /] - You're looking at it
- #url[Note Tree, https://github.com/Tejas-H5/Working-on-Tree] - a note-taking App 
    with time-tracking capabilities that saves it's state to IndexedDB that I use every day. 
- #url[Keyboard rhythm game, https://github.com/Tejas-H5/Javascript-Keyboard] - a rhythm game
    where you make use of all keys on the keyboard. It's probably broken right now, but I'll 
    get back to it and fix it _someday(TM)_.
- #url[Blog Language, https://github.com/Tejas-H5/blog-lang] - a very minimal subset of markdown with 
    just the features I use, and nothing else
- #url[Pl2, https://github.com/Tejas-H5/pl2] - my third attempt at a programming language entirely in the browser.
    The #url[second attempt, https://github.com/Tejas-H5/prototyping-lang] was also done with this framework.
- An agentic harness orchestrator - This is extremely useful to build, if you have a lot of tokens to spend and
    you aren't even really sure what to do with them. 
    For example, if you have a claude subscription and you have 40% left, not spending them on something would be a waste.
    I think every person with the priveallege to be in such a position should try this out once, using any framework really, 
        just to have the experience. 
    Although I wrote this framework to optimize my own human productivity (I still don't use agents to develop my personal projects, yet), 
        they can use this one quite well apparently.
    You may still have to point them at the repo to read the tutorials, and also tell them to avoid doing memory allocations 
        in the render path, and put in the simple fps counter component somewhere so you can notice any performance regressions.
    (Do note it is better to make a _meta harness_, i.e a harness that is backed by another harness like claude CLI or codex CLI since
        they can make use of subscription pricing instead of API pricing, as of October 2026).
- A realtime intelligence platform - I haven't made it yet, but I've always wanted to make a tool 
    that can collect information from various realtime news-feeds, aggregate them, and then expose a 
    cool-looking frontend UI for them.
]

Right now it's mostly my own stuff, but I'll add more projects as I naturally stumble into them and think
    they are worth adding.

My projects aren't big by themselves. 
In fact, most of them are unremarkable projects that will be forgotten in the grand scheme of things, 
    but the ideas and the code that I wrote in one project can easily transfer to the next.
Some day, if I ever need to add a piano to my TODO-list app, I can! 
But more likely, I will be adding my minimal markdown parser to it.
And that markdown parser supports code blocks. 

```While not technically part of the markdown spec, all code blocks can specify a language
use magnifiying glass to read this next one  ------------------>
```

And if I set that language to `pl2`, I could put my Pl2 runner inside my note-taking app, couldn't I?
If I set that language to `keyboard`, I could insert my rhythm game chart editor inside my note taking app as well.
Even though the projects are small in isolation, they all present opportunities to combine and build upon themselves.
The same thing will happen with your projects too, should you decide to embark on the journey of building stuff
    that you want to build.

The AI hype will make you feel like you need to be building flight simulators or operating systems in a weekend,
    but it's usually better to just work on whatever you want, no matter how small or big.

Most of the stuff I build are offline utilities for myself.
It was particularly important to me that I can download the entire file as a single
    HTML file, and then run it offline.
I simply can't be bothered spinning up a backend server and setting up a domain - even this documentation page 
    is hosted on github-pages and not a real server.

If you do decide to start building stuff, the only advice I can give is to use a "peer dependencies" 
    structure for the stuff you write yourself.
This just the notion that a package can always be imported from a fixed absolute path, like `import from "imcf"` or
    `import blah from "blog-lang"` - it is not npm or package-manager specific.
You then structure your project like:

```folders
app-dir/
    src/ <-- make this the import root
        // make your 'libraries', i.e folders that can be copy-pasted between projects,
        // something at the import root, such that you can import them directly:
        imcf/
        math-utils/
        blog-lang/

        main.ts
        other-file.ts
        other-other-file.ts
```

You can now copy-paste and reuse entire libraries between your stuff without having
    to build packages.
