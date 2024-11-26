# COMPS381F-Academic-Server

# 1. Project Info
### Group 47
- Lu Yuk Tong (13439007)
- (13458384)
- (13448631)
- (13427531)

# 2. Project File Infro
## 2.1 server.js
### User Authentication
- Login: Users can log in using their credentials. The application checks if the user is an admin or a regular user and redirects accordingly.
- Logout: Users can log out, which redirects them to the login page.
### User Management
- Create User: Admins can create new users by providing necessary details such as ID, password, name, and scores.
- Read User Information: The application allows admins to read information about specific users or all non-admin users.
- Update User Information: Users can update their personal information (like name and phone number), while admins can update scores and other user details.
- Delete User: Admins have the ability to delete user records from the database.
### Score Management
- Update Scores: Admins can update scores for specific subjects (English, Chinese, Math) for users.
- View Scores: The application provides routes to view scores for individual users.
### Data Handling
- Database Interaction: The application uses MongoDB for data storage, allowing for CRUD operations on user accounts.
- Error Handling: It includes error handling for various operations, ensuring that appropriate messages are returned when actions fail (e.g., invalid credentials or user not found).
### Frontend Integration
- EJS Templating: The application uses EJS as the view engine to render dynamic content based on user interactions.
## 2.2 package.json
### The dependencies used:
- csv-parser
- express-formidable
- express
- body-parser
- mongoose
- ejs
## 2.3 views folder
- login.ejs (Login UI)
- NAcontent.ejs (It show the user's information for non-admin user)
- Acontent.ejs (If user are admin, they will redirect to this view)
- index.ejs (It is the view for admin, can see the all students record, have the search bar, and the bar chart to show the students score)
- sinfo.ejs (Same as index.ejs)
- update.ejs
- updateInfo.ejs (Let user update his information, e.g. ID, Password, Name and Phone No.)
- updateScore.ejs (It is for admin to update students' score)
- create.ejs (It is for admin to create new student file, include ID and Password)
## 2.4 models folder
- account.js (It is for setting the mongoose schema)

# 3. The cloud-based server URL 
## Still trying

# 4. Operation guides
## 4.1 Account
![{336ACB76-B8F8-45D4-9F01-9CA164ED8973}](https://github.com/user-attachments/assets/06e086f3-7aae-4c0e-b50a-af72802b4cbd)
- (Admin account) id: tony, password: 123
- (Non-admin account) id: tom, password: tom123
- (Non-admin account) id: test, pwd: test
## 4.2 Admin Login
### 4.2.1 Read - read student information
![{C901E7E3-86D9-4845-A8E6-862647643E1F}](https://github.com/user-attachments/assets/6fa4af3e-e038-48b2-ad76-91bf5498ee79)

### 4.2.2 Update - edit student record
### 4.2.3 Create - create a new student record
### 4.2.4 Delete - remove the student record
## 4.3 Non-admin Login
### 4.3.1 Read - read its own information
### 4.3.2 Update - edit its ID, Name or Phone No.
## 4.4 RESTful CRUD Services
### 4.4.1 Create [Need Admin, create student record]
- curl -X POST http://localhost:8099/api/create -H "Content-Type: application/json" -d '{"id":"tony","pwd":"123","newid":"bob","newpwd":"bob123", "name":"Bob Leung","phone":"1234567890","eng":4,"chi":4,"math":4}'
  - Result: Admin "tony" create a new Student File id called "bob", named "Bob Leung", which login password is "bob123", 
its phone number is "1234567890", English score is "4", Chinese Score is "4", Math score is "4"
### 4.4.2 Read [Need Admin, Check all student record, sort(0: ascend, 1: descend), default is sort=0]
- curl -G "http://localhost:8099/api/read/all" --data-urlencode "id=tony" --data-urlencode "pwd=123" --data-urlencode "sort=1"
  - Result: Show all non-admin account information, sort descending
### 4.4.3 Read [Need Admin, Check specfic student record]
- curl -G "http://localhost:8099/api/read/one" --data-urlencode "id=tony" --data-urlencode "pwd=123" --data-urlencode "targetid=test"
  - Result: show the specfic account "test"'s information
### 4.4.4 Read [Any User, Check his own information]
- curl -G "http://localhost:8099/api/read" --data-urlencode "id=tom" --data-urlencode "pwd=tom123"
  - Result: show the account "tom"'s information
### 4.4.5 Update [Need Admin, Edit specfic account information (eng, chi, math)]
- curl -X PUT http://localhost:8099/api/updateScore -H "Content-Type: application/json" -d '{"id":"tony","pwd":"123","targetid":"test","math":"4"}'
  - Result: Account "test"'s math score is update to "4"
### 4.4.6 Update [Need Admin, Edit specfic account information (eng, chi, math)]
- curl -X PUT http://localhost:8099/api/updateScore -H "Content-Type: application/json" -d '{"id":"tony","pwd":"123","targetid":"test","eng":"5","chi":"4"}'
  - Result: Account "test"'s english score and math score are update to "5" and "4"
### 4.4.7 Update [Any User, Edit hos own account information (name, pno)]
- curl -X PUT http://localhost:8099/api/updateInfo -H "Content-Type: application/json" -d '{"id":"tony","pwd":"123","pno":"99999999", "name":"tonyy"}'
  - Result: Account "tony" phone number is update to "99999999" and name update to "tonyy"
### 4.4.8 Delete [Need Admin, Delete specfic user]
- curl -X DELETE http://localhost:8099/api/delete -H "Content-Type: application/json" -d '{"id":"tony","pwd":"123","targetid":"bob"}'
  - Result: Account "bob" got deleted
