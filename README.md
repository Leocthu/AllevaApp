# Alleva Medical Manufacturing Website

Welcome to the Alleva Medical Web Application repository! My name is Leo, and I recently graduated from UCSD with a bachelor's degree in Math and Computer Science. Currently, I am working on building this website for Alleva Medical, where we specialize in manufacturing compression pumps and sleeves designed to massage patients' legs and improve blood flow.


## Project Overview

The primary goal of this project is to create a user-friendly website that allows clients to input measurements and place orders directly through the platform. These orders are then seamlessly transmitted to Alleva Medical for the customization of compression sleeves tailored to each individual.

## Technologies Used

- React Native: The web application is built using React Native, providing a responsive and dynamic user interface.

- AWS Hosting: The application is hosted on Amazon Web Services (AWS) to ensure scalability and reliability.

- Firebase Realtime Database: To enhance the efficiency of the order and sleeve-making process, Firebase Realtime Database is utilized for real-time updates.

- AWS Simple Email Service (SES): Communication between clients and the company is facilitated through AWS SES. Clients receive confirmation emails upon order placement, and distributors are notified when orders are approved.

- Firebase Authentication: Multiple account levels are implemented for different access levels:

    - Manufacturer (Alleva Medical): Full access to all orders and user information, as the primary company running the website.
    - Distributor: Access restricted to user information and orders under their company, ensuring confidentiality with respect to other distributors.
    - Client: Limited access, allowing clients to view only their own orders and place orders through the website.

## How to Run the Application

1. Clone the repository to your local machine.
2. Install the necessary dependencies using npm install.
3. Set up the required configuration files for AWS and Firebase.
4. Run the application using npm start.

Website is also hosted at https://tester.d297kqkc6hdmw2.amplifyapp.com/

## Contact Information

For any questions or inquiries, feel free to reach out to me:

Email: leocthu@gmail.com

Thank you for checking out the Alleva Medical Web Application!

