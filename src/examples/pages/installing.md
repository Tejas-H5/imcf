# How to install IMCF

## Install via npm

<!-- This library used to be called `im-js`. But I wanted to upload it to NPM, and -->
<!--     someone already has that as a scope.  -->
<!-- So I had to think for multiple weeks about how to rename the package.  -->
<!-- As you can see from `im-js`, and now `imcf`, I am apparently not very good at naming things.  -->

This is the main way to install things.

TODO: upload the package.

## Manually vendoring

Copy the folders you need from #url[this GitHub repository, https://github.com/Tejas-H5/imjs]
    into your project.

```
imcf/
    <all files> (required)
        The core framework. You'll need every file here, but not necessarily the folders

    im-ui/      (optional)
        A minimal design system I've included for my own convenience.
        It's optional - imcf will work without it.

    tests/  (ignore)
        I put the tests here, you can ignore them.

<other folders>  (ignore)
```

## Importing stuff

The main framework is everything exported from `"imcf"`:

```typescript
import { im, imdom, el, elsvg, ev, key } from "imcf";
```

I've also included `im-ui`, for my own convenience really:

```typescript
import { imButtonPressed } from "imcf/im-ui/components/im-button";
```

It's a minimal component library and design-system that I use for all my projects. 
It most-likely won't be any good for your project - it exists to draw inspiration 
    for your own design system that will be better suited to the things you're working on.

## Code-formatters

The code you write in this framework will abuse the hell out of semi-colons, code blocks
    and putting multiple relevant function calls on the same line in general 
    (See the examples on #url[previous page, /?test=Overview]).
Your formatter needs to be configured to not do this:

#table[
#row #cell *Unformatted* #cell *Formatted. It's good for normal code, but bad for our framework's UI code*
#row 
#cell

```typescript
im.For(c); for (const item of items) {
    ...
} im.ForEnd(c);
```
#cell

```typescript
im.For(c); 
for (const item of items) 
{
    ...
} 
im.ForEnd(c);
```
]

The default TypeScript formatter will never add or remove newlines, and only
    formats whiltespace.
That's the one that I use.

Now that you're set up, you'll want to do the #url[first tutorial, /?test=Tutorial+0+-+Immediate+Mode+Control+Flow+annotations].
It's the only one that you shouldn't skip - do that one first, and then the others
are optional.

## Linters

None, yet. 
Eventually, I want something that can match up begin/end pairs.
It's the biggest source of pain in this framework, and probably
    the only reason why other people haven't already created a similar framework.
The benefits outweight the costs imo.
