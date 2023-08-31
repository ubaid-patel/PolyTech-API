# Polytechnic College Management App

Welcome to the Polytechnic College Management App documentation. This app serves as a robust platform to manage various aspects of college operations, providing distinct user roles including HOD, Faculty, Student, and Admin. With features like IA Marks Upload, Results Upload with Excel Import, Attendance Management, and Subject Allocation to Faculty, this app streamlines college administration and enhances communication.

## Features

### User Roles

- **Admin:** Has access to all functionalities. Responsible for managing users, configuring system settings, and overseeing overall app usage.

- **HOD (Head of Department):** Manages academic activities within a department. Can allocate subjects to faculty and review results.

- **Faculty:** Records attendance, uploads internal assessment (IA) marks, and manages course-related activities.

- **Student:** Views attendance, IA marks, and results. Can communicate with faculty and HOD.

### IA Marks Upload

Faculty members can upload internal assessment marks for various subjects using Excel files. The system ensures secure data handling and keeps track of the uploaded marks.

### Results Upload with Excel Import

HOD can upload students' results using Excel files. The system validates and processes the data, ensuring accurate and efficient result management.

### Mark Attendance

Faculty members mark attendance for their respective classes. The app provides an intuitive interface to track attendance records and generate reports.

### Subject Allocation

HOD can allocates subjects to faculty members. This feature facilitates effective course distribution and management within departments.

## Getting Started
### Api documentation
You can view complete api documentation at [gptglbapi.vercel.app](https://gptglbapi.vercel.app)
### Depolyemnt
For demo visit [https://gptglb.vercel.app](https://gptglb.vercel.app)

1. Clone this repository to your local machine:

```bash
git clone https://github.com/your-username/college-management-app.git
cd college-management-app
```
### Install the required dependencies using npm:
```
npm install
```

### Database Setup
This app requires a database to store user information, attendance records, marks, and other data.we used mysql database create a database then
Download our db.sql and import it in the created db [click here to download](https://urlpro.vercel.app/kj8Gbh)

### Create a .env file in root directory
```
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=password
MYSQL_DATABASE=dbname
SECRET_KEY=appsecretkey
```

### Run the application:

```
npm start
```
Access the app by opening http://localhost:3000 in your web browser.

## Contributing
We encourage contributions from the community. 

## Support
For any questions or assistance, contact us at ubaidpatel595@gmail.com
