# Skeeme

**Skeeme** is a modern, AI-powered Exam Management System built to streamline the assessment process for educational institutions. It facilitates secure exam delivery, automated grading, and comprehensive student result tracking.

## 🚀 Key Features

*   **AI-Powered Grading**: Automate the grading of complex questions using advanced AI models.
*   **Secure Exam Delivery**: A robust, time-controlled environment for students to longer exams with anti-cheat measures.
*   **Dynamic Timezone Support**: Automatically detects and adapts to the user's local timezone for accurate scheduling globally.
*   **Real-time Analytics**: Lecturers get deep insights into student performance and question difficulty.
*   **Modern UI/UX**: Built with the **Flux** design system for a premium, accessible, and responsive user experience.
*   **Role-Based Access**: Specialized dashboards for Lecturers, Students, and Admins.

## 🛠️ Tech Stack

*   **Framework**: [Laravel 11](https://laravel.com)
*   **Frontend**: [Livewire](https://livewire.laravel.com), [Alpine.js](https://alpinejs.dev), [Tailwind CSS](https://tailwindcss.com)
*   **Database**: MySQL
*   **UI Library**: Flux
*   **Deployment**: Dockerized for seamless deployment on platforms like Render.

## 💻 Local Development

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/skeeme.git
    cd skeeme
    ```

2.  **Install Dependencies**:
    ```bash
    composer install
    npm install
    ```

3.  **Environment Setup**:
    ```bash
    cp .env.example .env
    php artisan key:generate
    ```
    *Configure your database credentials in the `.env` file.*

4.  **Run Migrations**:
    ```bash
    php artisan migrate
    ```

5.  **Start the Server**:
    ```bash
    npm run dev
    php artisan serve
    ```

## 📦 Deployment

This project is configured for containerized deployment.
*   **Docker**: Includes a production-ready `Dockerfile`.
*   **Render**: customized `render.yaml` for auto-deploying the web service and a managed MySQL database.

## 📄 License

Proprietary software. All rights reserved.
