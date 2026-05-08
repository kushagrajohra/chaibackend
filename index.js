// src me directory store kar rhe h abse 
// touch src/app.js humne ek file bnayi app.js ke naam se in src folder ke andar
// touch app.js mtlb current directory me app.js file bnani h

// humne pdha h ki hum jab bhi server on karte h ab kuch update karoge toh server ko restart karna padega taki changes reflect ho sake
// lekin humne ek package install kiya h nodemon jisse humara server automatically restart ho jayega jab bhi hum changes karenge
// npm i nodemon --save-dev this is for development purpose only yeh dev dependency me add hoga production me nhi hoga kuch bhi update karne ke baad server ko restart karna padega taki changes reflect ho sake
// package.json me "devDependencies": { "nodemon": "^3.1.14" } add ho gaya h
// ab hum package.json me "scripts": { "start": "node src/app.js", "dev": "nodemon src/app.js" } add karenge taki hum start command se server ko start kar sake aur dev command se server ko automatically restart kar sake jab bhi changes karenge
//  "dev": "nodemon src/app.js" ab agar hum dev script run karenge toh server yeh src/app.js file ko watch karega aur jab bhi is file me changes honge toh server automatically restart ho jayega taki changes reflect ho sake