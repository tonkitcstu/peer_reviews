// Constants for the application
const API_ENDPOINT_GET_MEMBER = 'https://mkoawdo5axefsdqyhnqgxkymse0sbrxm.lambda-url.ap-southeast-1.on.aws/';
const API_ENDPOINT_SUBMIT_REVIEW = 'https://dplcfps4nkb5jsrqia2fj7xqye0rhzqn.lambda-url.ap-southeast-1.on.aws/';

const criteria = [
    'งานที่สมาชิกคนนี้ทำมีคุณภาพมากน้อยเพียงใด?',
    'สมาชิกคนนี้ส่งมอบงานตรงเวลามากน้อยเพียงใด?',
    'สมาชิกคนนี้สนับสนุนทีมและแบ่งปันความคิดเห็นมากน้อยเพียงใด?',
    'สมาชิกคนนี้สื่อสารกับทีมได้ดีเพียงใด?',
    'สมาชิกคนนี้มีบทบาทสำคัญต่อความสำเร็จของทีมมากน้อยเพียงใด?'
];

// Get and validate URL parameters
const urlParams = new URLSearchParams(window.location.search);
const uid = urlParams.get('token');

// Store current group members and reviewer
let currentGroupMembers = {};
let currentReviewer = null;
let currentGroup = null;
let reviewerId = null;

// Add notification system
function showNotification(message, type = 'success') {
    // Remove any existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;

    // Add styles dynamically
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px;
            border-radius: 5px;
            animation: slideIn 0.5s ease-in-out;
            z-index: 1000;
            min-width: 300px;
            max-width: 500px;
        }

        .notification.success {
            background-color: #4CAF50;
            color: white;
        }

        .notification.error {
            background-color: #f44336;
            color: white;
        }

        .notification-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .notification-close {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            font-size: 20px;
            padding: 0 5px;
        }

        .notification-message {
            margin-right: 15px;
        }

        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        /* Submit button styles */
        #submitReviews {
            background-color: #4CAF50;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.3s ease;
        }

        #submitReviews:hover:not(:disabled) {
            background-color: #45a049;
        }

        #submitReviews:disabled {
            background-color: #cccccc;
            color: #666666;
            cursor: not-allowed;
            position: relative;
        }

        #submitReviews:disabled::after {
            content: '✓ Submitted';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            white-space: nowrap;
        }
    `;

    document.head.appendChild(style);
    document.body.appendChild(notification);

    // Add close button functionality
    const closeButton = notification.querySelector('.notification-close');
    closeButton.addEventListener('click', () => {
        notification.remove();
    });

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Show error message
function showError(message) {
    // Hide loading container
    document.getElementById('loadingContainer').classList.add('hidden');
    
    document.body.innerHTML = `
        <div class="container">
            <h1 class="error-title">Access Error</h1>
            <p class="error-message">${message}</p>
        </div>
    `;
}

// Validate URL parameters and initialize form
async function validateAndInitialize() {
    // Loading state is shown by default (in HTML)
    
    // Check if uid parameter is present
    if (!uid) {
        showError('Missing user ID parameter. Please check the URL.');
        return;
    }

    try {
        const response = await fetch(`${API_ENDPOINT_GET_MEMBER}?uid=${uid}`);
        const result = await response.json();
        
        if (result.status === 'success') {
            if (result.message === 'you already review') {
                // Hide loading container
                document.getElementById('loadingContainer').classList.add('hidden');
                
                // Get reviewer info from the response
                const reviewerId = Object.keys(result.reviewer)[0];
                const reviewerName = result.reviewer[reviewerId];
                
                // Show a friendly message for already submitted reviews
                document.body.innerHTML = `
                    <div class="container already-reviewed">
                        <h1>Review Already Submitted</h1>
                        <div class="reviewer-details">
                            <h2>ข้อมูลผู้ประเมิน</h2>
                            <p><strong>รหัสนักศึกษา:</strong> ${reviewerId}</p>
                            <p><strong>ชื่อ-นามสกุล:</strong> ${reviewerName}</p>
                        </div>
                        <div class="message-content">
                            <p>You have already submitted your peer reviews for this group.</p>
                            <p>If you need to make any changes to your submission, please contact your TA.</p>
                        </div>
                        <div class="contact-info">
                            <p>Thank you for your participation!</p>
                        </div>
                    </div>
                `;

                // Add styles for the already reviewed message
                const style = document.createElement('style');
                style.textContent = `
                    .already-reviewed {
                        max-width: 600px;
                        margin: 50px auto;
                        padding: 30px;
                        text-align: center;
                        background-color: #f8f9fa;
                        border-radius: 8px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }

                    .already-reviewed h1 {
                        color: #4CAF50;
                        margin-bottom: 20px;
                        font-size: 28px;
                    }

                    .already-reviewed h2 {
                        color: #333;
                        font-size: 20px;
                        margin: 15px 0;
                    }

                    .reviewer-details {
                        background-color: #fff;
                        padding: 20px;
                        border-radius: 6px;
                        margin: 20px 0;
                        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                    }

                    .reviewer-details p {
                        margin: 10px 0;
                        color: #333;
                    }

                    .reviewer-details strong {
                        color: #2196F3;
                    }

                    .message-content {
                        margin: 20px 0;
                    }

                    .message-content p {
                        color: #333;
                        line-height: 1.6;
                        margin-bottom: 15px;
                    }

                    .contact-info {
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid #ddd;
                    }

                    .contact-info p {
                        color: #666;
                        font-style: italic;
                    }
                `;
                document.head.appendChild(style);
                return;
            }
            currentGroupMembers = result.data.member;
            currentGroup = result.data.group;
            // Get the reviewer ID (first key from reviewer object)
            reviewerId = Object.keys(result.data.reviewer)[0];
            currentReviewer = result.data.reviewer[reviewerId];
            
            // Initialize the form before showing it
            await initializeForm();
            
            // Hide loading and show main container
            document.getElementById('loadingContainer').classList.add('hidden');
            document.getElementById('mainContainer').classList.remove('hidden');

            // Add warning message after form is shown
            const warningDiv = document.createElement('div');
            warningDiv.className = 'warning-message';
            warningDiv.innerHTML = `
                <p>คำเตือน: กรุณาตรวจสอบความถูกต้องของรีวิว เมื่อกด submit ไปแล้วจะไม่สามารถทำการแก้ไขได้</p>
            `;
            
            // Add warning styles
            const style = document.createElement('style');
            style.textContent = `
                .warning-message {
                    background-color: #fff3cd;
                    border: 1px solid #ffeeba;
                    color: #856404;
                    padding: 15px;
                    border-radius: 4px;
                    margin: 20px 0;
                    text-align: center;
                    font-weight: 500;
                }

                .warning-message p {
                    margin: 0;
                }
            `;
            document.head.appendChild(style);

            // Insert warning message before the submit button
            const submitButton = document.getElementById('submitReviews');
            submitButton.parentNode.insertBefore(warningDiv, submitButton);
        } else {
            showError('Access denied: ' + (result.message || 'Invalid credentials'));
        }
    } catch (error) {
        showError('An error occurred while verifying access.');
        console.error('Verification error:', error);
    }
}

// Initialize the form
async function initializeForm() {
    document.getElementById('submitReviews').addEventListener('click', handleSubmit);
    // Update the reviewer section
    const reviewerSection = document.querySelector('.reviewer-section');
    if (reviewerSection) {
        reviewerSection.innerHTML = `
            <div class="reviewer-info">
                <h3>ข้อมูลผู้ประเมิน</h3>
                <p><strong>รหัสนักศึกษา:</strong> ${reviewerId}</p>
                <p><strong>ชื่อ-นามสกุล:</strong> ${currentReviewer}</p>
            </div>
        `;
    }

    // Now we can safely update the elements
    const mainTitle = document.getElementById('mainTitle');
    if (mainTitle) {
        mainTitle.textContent = `Peer Review Form - Group ${currentGroup}`;
    }

    generateReviewForms();
}

// Generate review forms for other members
function generateReviewForms() {
    const reviewFormsContainer = document.getElementById('reviewForms');
    if (!reviewFormsContainer) return;

    reviewFormsContainer.innerHTML = '';
    
    // Add explanation section
    const explanationSection = document.createElement('div');
    explanationSection.className = 'explanation-section';
    explanationSection.innerHTML = `
        <div class="explanation-content">
            <p>นักศึกษาทุกคนจะต้องประเมินตนเองและเพื่อนร่วมทีมในงานกลุ่มตามเกณฑ์ที่กำหนดไว้ใน Rubrics การให้คะแนน ที่สามารถดูรายละเอียดได้จาก<a href="https://drive.google.com/file/d/1A-cJTArTatT8IZQaRAWlmuHaaq2Exc-8/view?usp=drive_link" target="_blank">ลิงก์นี้</a></p>
            <p>กรุณาอ่านคำอธิบายของเกณฑ์แต่ละข้อให้เข้าใจ และให้คะแนนอย่างยุติธรรมและสร้างสรรค์ เพื่อช่วยสนับสนุนการเรียนรู้ของเพื่อนร่วมทีม คำประเมินจะเป็นส่วนสำคัญในการสะท้อนมุมมองและบทบาทของนักศึกษาในทีม</p>
            <div class="note-section">
                <p><strong>หมายเหตุ:</strong> หากมีคำถามเกี่ยวกับ Rubrics หรือแบบฟอร์ม Peer Review สามารถสอบถามได้ที่พี่ TA และอาจารย์ผู้สอนทั้งสองท่านค่ะ</p>
            </div>
        </div>
    `;
    reviewFormsContainer.appendChild(explanationSection);
    
    // First add self evaluation
    const selfEvalForm = createReviewForm(0, reviewerId, currentReviewer, true);
    reviewFormsContainer.appendChild(selfEvalForm);

    let index = 1;
    Object.entries(currentGroupMembers).forEach(([memberId, memberName]) => {
        if (memberId === reviewerId) return; // Skip the reviewer

        const reviewForm = createReviewForm(index, memberId, memberName, false);
        index++;
        reviewFormsContainer.appendChild(reviewForm);
    });

    // Add problems section after all review forms
    const problemsSection = document.createElement('div');
    problemsSection.className = 'problems-section';
    problemsSection.innerHTML = `
        <h3>ปัญหาที่พบระหว่างการทำงาน</h3>
        
        <div class="problem-field">
            <label for="problems-encountered">ปัญหาที่พบ</label>
            <div class="problem-subtitle">โปรดระบุปัญหาที่พบระหว่างการทำงาน เช่น ความขัดแย้งในการตัดสินใจ ความล่าช้าในการทำงาน หรือความเข้าใจที่ไม่ตรงกัน</div>
            <textarea id="problems-encountered" class="problem-textarea" placeholder="ระบุปัญหาที่พบ..."></textarea>
        </div>

        <div class="problem-field">
            <label for="problem-solutions">วิธีการแก้ไข</label>
            <div class="problem-subtitle">โปรดอธิบายถึงวิธีการที่ทีมใช้ในการแก้ไขปัญหา เช่น การประชุมพูดคุย การปรับตารางเวลา หรือการแบ่งหน้าที่ใหม่</div>
            <textarea id="problem-solutions" class="problem-textarea" placeholder="ระบุวิธีการแก้ไข..."></textarea>
        </div>
    `;
    reviewFormsContainer.appendChild(problemsSection);
}

// Create individual review form
function createReviewForm(index, memberId, memberName, isSelfEval) {
    const formDiv = document.createElement('div');
    formDiv.className = 'review-form';
    formDiv.dataset.memberId = memberId;

    formDiv.innerHTML = `
        <h2>${isSelfEval ? 'ประเมินตนเอง' : `ประเมินสมาชิกคนที่ ${index} : ${memberName} (${memberId})`}</h2>

        ${criteria.map((criterion, index) => `
            <div class="rating-row" data-criterion="${index}">
                <div class="rating-criteria">${criterion}</div>
                <div class="star-rating">
                    ${[1, 2, 3, 4, 5].map(score => `
                        <input type="radio" id="${memberId}-${index}-${score}" name="${memberId}-${criterion}" value="${6-score}" required>
                        <label for="${memberId}-${index}-${score}">★</label>
                    `).join('')}
                </div>
                <div class="validation-message"></div>
            </div>
        `).join('')}
        <div class="comment-section">
            <label for="comments-${memberId}">โปรดสรุปถึงการมีส่วนร่วมของ${isSelfEval ? 'ตนเอง' : 'สมาชิกคนนี้'}อย่างเป็นรูปธรรม โดยเฉพาะหากมีข้อใดข้างบนที่นักศึกษาให้คะแนนต่ำกว่า 4 ควรให้เหตุผลประกอบที่นี่</label>
            <div class="comment-warning" style="display: none;">
                <p style="color: #ff4d4f; margin: 10px 0; font-weight: 500;">⚠️ มีการให้คะแนนต่ำกว่า 4 กรุณาให้ความคิดเห็นเพิ่มเติม</p>
            </div>
            <textarea id="comments-${memberId}" class="review-comment" placeholder="ระบุความคิดเห็น..."></textarea>
        </div>
    `;

    // Add event listeners for validation feedback
    formDiv.querySelectorAll('.rating-row').forEach(row => {
        const inputs = row.querySelectorAll('input[type="radio"]');
        inputs.forEach(input => {
            input.addEventListener('change', () => {
                row.classList.remove('incomplete');
                row.querySelector('.validation-message').textContent = '';
                
                // Check if any rating is less than 4
                const form = input.closest('.review-form');
                const allRatings = form.querySelectorAll('input[type="radio"]:checked');
                const hasLowRating = Array.from(allRatings).some(rating => parseInt(rating.value) < 4);
                
                const commentWarning = form.querySelector('.comment-warning');
                const textarea = form.querySelector('.review-comment');
                
                if (hasLowRating) {
                    commentWarning.style.display = 'block';
                    textarea.setAttribute('required', 'required');
                } else {
                    commentWarning.style.display = 'none';
                    textarea.removeAttribute('required');
                }
            });
        });
    });

    return formDiv;
}

// Handle form submission
async function handleSubmit() {
    const submitButton = document.getElementById('submitReviews');
    
    // Show confirmation dialog
    const isConfirmed = confirm('คุณแน่ใจหรือไม่ที่จะส่งการประเมิน? หลังจากส่งแล้วจะไม่สามารถแก้ไขได้');
    
    if (!isConfirmed) {
        return;
    }

    // Disable the button and show loading state while submitting
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';

    const reviews = {};
    const reviewForms = document.querySelectorAll('.review-form');
    let isValid = true;

    // Reset all validation states
    document.querySelectorAll('.rating-row').forEach(row => {
        row.classList.remove('incomplete');
        row.querySelector('.validation-message').textContent = '';
    });

    reviewForms.forEach(form => {
        const memberId = form.dataset.memberId;
        const ratings = {};
        let hasLowRating = false;
        
        // Get all ratings
        const criteriaRows = form.querySelectorAll('.rating-row');
        criteriaRows.forEach((row, index) => {
            const selectedRating = row.querySelector('input[type="radio"]:checked');
            if (!selectedRating) {
                isValid = false;
                row.classList.add('incomplete');
                row.querySelector('.validation-message').textContent = 'Please select a rating';
                return;
            }
            const ratingValue = parseInt(selectedRating.value);
            if (ratingValue < 4) {
                hasLowRating = true;
            }
            ratings[`criterion_${index + 1}`] = ratingValue;
        });

        // Get comments
        const comments = form.querySelector('.review-comment').value.trim();
        
        // Validate comments if there are low ratings
        if (hasLowRating && !comments) {
            isValid = false;
            form.querySelector('.comment-warning').style.display = 'block';
            showNotification('กรุณาให้ความคิดเห็นเพิ่มเติมสำหรับคะแนนที่ต่ำกว่า 4', 'error');
        }

        reviews[memberId] = {
            ratings,
            comments
        };
    });

    if (!isValid) {
        showNotification('กรุณากรอกข้อมูลให้ครบถ้วน และให้ความคิดเห็นสำหรับคะแนนที่ต่ำกว่า 4', 'error');
        submitButton.disabled = false;
        submitButton.textContent = 'Submit Reviews';
        return;
    }

    const finalResult = {
        reviewer: reviewerId,
        group: currentGroup,
        problems: {
            encountered: document.getElementById('problems-encountered')?.value.trim() || '',
            solutions: document.getElementById('problem-solutions')?.value.trim() || ''
        },
        reviews
    };

    try {
        const response = await fetch(`${API_ENDPOINT_SUBMIT_REVIEW}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(finalResult)
        });

        const result = await response.json();
        
        if (response.status === 200 && result.status === 'success') {
            showNotification('Reviews submitted successfully!', 'success');
            // Keep button disabled and update its appearance
            submitButton.disabled = true;
            submitButton.textContent = '';  // Clear text as we'll show checkmark via CSS
        } else {
            showNotification(`Submission failed: ${result.message}`, 'error');
            // Re-enable the button if submission failed
            submitButton.disabled = false;
            submitButton.textContent = 'Submit Reviews';
        }
    } catch (error) {
        console.error('Error submitting reviews:', error);
        showNotification('An error occurred while submitting the reviews. Please try again.', 'error');
        // Re-enable the button if there was an error
        submitButton.disabled = false;
        submitButton.textContent = 'Submit Reviews';
    }
}

// Initialize the form when the page loads
document.addEventListener('DOMContentLoaded', validateAndInitialize); 