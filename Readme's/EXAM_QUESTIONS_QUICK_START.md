# Quick Start Guide - Exam Question Management

## 🚀 Getting Started in 3 Steps

### Step 1: Run Migrations
```bash
php artisan migrate
```
This creates the necessary database tables for question banks and exam questions.

### Step 2: Configure Deepseek API
The API key should already be in your `.env` file:
```
DEEPSEEK_API_KEY=your_key_here
```

### Step 3: Access the System
1. Login as a Lecturer
2. Go to "Exam Management" → Select Course
3. Create or select an exam
4. Click **"Manage Questions"** button

---

## 📚 User Guide - For Lecturers

### Tab 1: Review & Manage Questions ⭐
**What it does:** Shows all questions added to the exam
- View question details
- Drag to reorder
- Edit marks per question
- Delete questions
- Preview with full formatting

**Actions:**
- Click "Preview" to see how students will see it
- Click "Remove" to delete a question
- Change marks in the input field
- Drag cards to reorder

---

### Tab 2: Manual Entry ✍️
**What it does:** Create questions directly
- Best for: Specific exam questions not in bank

**Steps:**
1. Type your question text
2. Select question type (MCQ, T/F, Essay, etc.)
3. Set difficulty level
4. Enter options (for MCQ/True-False)
5. Mark the correct answer
6. Add explanation (optional)
7. Set marks
8. Click "Add Question"

**Question Types:**
- **Multiple Choice**: 4 options, 1 correct
- **True/False**: 2 options, simple
- **Short Answer**: Text response
- **Essay**: Long answer
- **Fill in Blank**: Complete the statement

---

### Tab 3: Question Bank 🏦
**What it does:** Reuse previously created questions
- Best for: Common questions, repeated exams

**Steps:**
1. Select a question bank
2. Search by question text or topic
3. Filter by difficulty
4. Click the "+" button to add to exam

**Pro Tips:**
- Questions are automatically saved to your bank
- Each course has its own bank
- Search across all questions in the bank
- Build up your bank for future exams

---

### Tab 4: AI Generator 🧠
**What it does:** Generate questions automatically from materials
- Best for: Quickly creating varied questions

**Steps:**
1. **Provide Materials:**
   - Paste course notes, OR
   - Upload PDF/DOCX/TXT files
   - Can mix both methods

2. **Configure:**
   - Set number of questions (1-120)
   - Choose difficulty (Mixed, Easy, Medium, Hard)
   - Select question types you want

3. **Generate:**
   - Click "Generate Questions"
   - Wait for processing (30-60 seconds typically)

4. **Review & Select:**
   - Preview each question
   - Check box to select
   - Click "Add Selected" to add to exam
   - Selected questions auto-save to bank

**Tips:**
- Include clear, structured materials
- Specify learning objectives in notes
- Select fewer question types for faster generation
- Preview before committing

---

## 💡 Best Practices

### Question Creation
✅ **DO:**
- Use clear, unambiguous language
- Include explanations for answers
- Tag questions with topics
- Set appropriate difficulty levels
- Keep multiple choice options similar in length

❌ **DON'T:**
- Make questions ambiguous
- Use trick questions
- Have options that are too different in length
- Exceed 120 questions (AI limit)

### Question Bank Management
✅ **DO:**
- Organize by topic
- Tag difficulty levels
- Build bank gradually
- Review and update old questions
- Share templates with colleagues

### Using AI Generator
✅ **DO:**
- Provide comprehensive materials
- Use clear, structured notes
- Preview all questions before adding
- Mix question types for variety
- Regenerate if results aren't good

❌ **DON'T:**
- Use vague or incomplete materials
- Add all generated questions without review
- Generate too many at once
- Skip the preview step

---

## 🐛 Troubleshooting

### AI Not Generating Questions
**Check:**
1. Is DEEPSEEK_API_KEY set in .env?
2. Are you providing course materials?
3. Is number of questions between 1-120?
4. Is your internet connection stable?

**Fix:**
- Copy API key from settings
- Paste clear, complete materials
- Check API quota/billing
- Try smaller batch (10 questions first)

### Questions Not Appearing in Bank
**Check:**
1. Are you on the right course?
2. Did you complete the "Add Question" step?
3. Check browser console for errors

**Fix:**
- Go to Review tab - should see all questions there
- Refresh the page
- Try adding a manual question first

### Marks Not Calculating Correctly
**Check:**
1. Each question has marks assigned?
2. Marks are decimal format (1, 1.5, 2, etc.)?

**Fix:**
- Update each question's marks field
- Ensure no blank marks entries
- Reload the Review tab

---

## 📱 Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Preview Question | `Click Preview button` |
| Delete Question | `Click Remove button` |
| Select All AI Questions | `Click Select All` |
| Search Questions | `Ctrl/Cmd + F` |

---

## 🎓 Sample Workflow

### Example: Create Biology Exam

1. **Go to Exam Management**
   - Course: "Biology 101"
   - Exam: "Photosynthesis Quiz"

2. **Click "Manage Questions"**

3. **Add Question 1: Manual**
   - Tab: Manual Entry
   - Create MCQ about photosynthesis
   - Add 1 mark
   - Click Add Question

4. **Add Questions 2-5: From Bank**
   - Tab: Question Bank
   - Search: "photosynthesis"
   - Click Add for 4 questions

5. **Add Questions 6-15: AI Generated**
   - Tab: AI Generator
   - Paste photosynth notes
   - Generate 10 questions
   - Preview each
   - Select all good ones

6. **Review & Polish**
   - Tab: Review
   - Check all 15 questions
   - Reorder as needed
   - Verify 15 marks total
   - Save

---

## 📊 What Gets Saved Where

| Item | Location | Auto-Saved |
|------|----------|-----------|
| Exam Details | Exams Table | ✅ |
| Questions | Questions Table | ✅ |
| Question Bank | QuestionBank Table | ✅ |
| Exam-Question Link | ExamQuestions Table | ✅ |
| Question Marks | ExamQuestions.marks | ✅ |
| Question Order | ExamQuestions.order | ✅ |

---

## 🔐 Access Control

- **Can view:** Only your own exams
- **Can edit:** Only draft exams
- **Can generate AI:** With active Deepseek API key
- **Question bank:** Per course per lecturer

---

## 📞 Common Questions

**Q: Can I edit a question after adding it?**
A: Yes, in the Review tab, click the question to edit (feature to be added)

**Q: Will AI questions be different each time?**
A: Yes, slight variations based on temperature settings

**Q: Can I undo deleting a question?**
A: No, but it stays in your question bank

**Q: How long does AI generation take?**
A: 30-60 seconds typically for 10 questions

**Q: Can I use the same question in multiple exams?**
A: Yes, that's the purpose of the question bank

**Q: What format are uploaded notes?**
A: Supports PDF, DOCX, TXT, and pasted text

---

## 🎯 Pro Tips

1. **Build Your Bank:** Create questions gradually, reuse often
2. **Use AI for Variations:** Generate multiple versions for different sections
3. **Preview Everything:** Always check questions before publishing
4. **Tag Topics:** Makes searching much easier later
5. **Set Difficulty:** Helps with future filtering
6. **Use Explanations:** Students can learn from answers
7. **Backup Materials:** Keep your course notes organized
8. **Test Generation:** Try with small amounts first

---

## 📈 Analytics After Exam

Once students take the exam, you can:
- View analytics dashboard
- See question difficulty vs student performance
- Identify problematic questions
- Update question bank notes

---

**Need Help?** Check the main implementation guide: `EXAM_QUESTIONS_IMPLEMENTATION.md`
