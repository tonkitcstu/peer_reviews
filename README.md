# Peer Review Application

A web-based peer review system designed for CS332/CS232 Introduction to Cloud Computing Technology course. This application allows students to submit peer reviews for their team members, evaluating various aspects of their teammates' contributions and performance.

## Features

- **Secure Access**: Uses token-based authentication via URL parameters
- **User-Friendly Interface**: Clean and responsive design that works on both desktop and mobile devices
- **Comprehensive Review System**: Evaluates team members across 5 key criteria:
  - Work quality
  - Timeliness of deliverables
  - Team support and idea sharing
  - Communication effectiveness
  - Overall contribution to team success
- **Real-time Validation**: Ensures all required fields are completed before submission
- **Submission Management**: Prevents duplicate submissions and provides clear feedback
- **Loading States**: Visual feedback during data loading and submission
- **Error Handling**: Clear error messages for various scenarios

## Technical Stack

- **Frontend**: Pure HTML, CSS, and JavaScript
- **Backend**: AWS Lambda (API Endpoints)
- **Styling**: Custom CSS with Roboto font from Google Fonts
- **API Integration**: RESTful API calls for data retrieval and submission

## Project Structure

```
├── index.html          # Main HTML file with the application structure
├── styles.css          # CSS styles for the application
├── script.js           # JavaScript logic and API integration
└── README.md          # Project documentation
```

## API Endpoints

The application interacts with two main API endpoints:

1. **Get Member Information**
   - Endpoint: Lambda URL (ap-southeast-1)
   - Purpose: Retrieves group member information and validates user access

2. **Submit Review**
   - Endpoint: Lambda URL (ap-southeast-1)
   - Purpose: Submits completed peer reviews

## Usage

1. Access the application using a provided URL with a valid token:
   ```
   index.html?token=<unique_token>
   ```

2. The system will validate your token and load your group information
3. Complete the peer review forms for each team member
4. Submit your reviews using the "Submit Reviews" button
5. Receive confirmation of successful submission

## Features in Detail

### Review Criteria
Each team member is evaluated on five key aspects:
- Quality of work
- Timely delivery
- Team support and idea sharing
- Communication effectiveness
- Contribution to team success

### User Interface
- Clean and intuitive design
- Responsive layout that adapts to different screen sizes
- Clear visual feedback for user actions
- Loading indicators for asynchronous operations

### Error Handling
- Invalid token detection
- Network error handling
- Duplicate submission prevention
- Required field validation

## Development

To modify or extend this application:

1. Clone the repository
2. Make changes to the relevant files:
   - `index.html` for structure changes
   - `styles.css` for styling updates
   - `script.js` for functionality modifications
3. Test thoroughly before deployment

## Security Features

- Token-based authentication
- API endpoint protection
- Prevention of multiple submissions
- Secure data transmission

## Browser Compatibility

The application is compatible with modern web browsers including:
- Google Chrome
- Mozilla Firefox
- Microsoft Edge
- Safari

## Notes

- The application requires a valid token to function
- Once reviews are submitted, they cannot be modified without administrator intervention
- All form fields are required for submission 