Jack's workspace
[x]: @App.tsx is using the stylesheet, and it's using the regular styles, but we want to use NativeWind. Also, should @App.tsx be deleted or should it just redirect to the index.tsx? → Deleted App.tsx (not used with Expo Router) and updated tailwind.config.js to scan app/ directory
[]: Migrate stylesheet to nativewind 5.0
[x]: Path Alias decide one place to do it → Optimized to 2 places (minimum viable): tsconfig.json (IDE/types) + babel.config.js (runtime). Removed metro.config.js extraNodeModules (not needed)

Whiteboard:
[-]: Babel Plugin Issue cannot put things there
[]: Design System components are not working and have lots of issues there

Eddie's computer
[X]: React Fabric Dev Error
[]: Typer Error: Exepect Bool --> String Anticipated components

