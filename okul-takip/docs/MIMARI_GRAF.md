# Mimari Bağımlılık Grafiği

> Bu dosya `node scripts/graph.mjs` ile otomatik üretilir.

Toplam dosya: **41**, import ilişkisi: **99**

```mermaid
flowchart LR
  subgraph server_src_app_js["server/src/app.js"]
    server_src_app_js["app.js"]
  end
  subgraph server_src_config["server/src/config"]
    server_src_config_index_js["index.js"]
  end
  subgraph server_src_modules["server/src/modules"]
    server_src_modules_auth_auth_routes_js["auth.routes.js"]
    server_src_modules_classrooms_classroom_model_js["classroom.model.js"]
    server_src_modules_classrooms_classroom_routes_js["classroom.routes.js"]
    server_src_modules_homeworks_homework_model_js["homework.model.js"]
    server_src_modules_homeworks_homework_routes_js["homework.routes.js"]
    server_src_modules_lessons_lesson_model_js["lesson.model.js"]
    server_src_modules_lessons_lesson_routes_js["lesson.routes.js"]
    server_src_modules_reports_report_routes_js["report.routes.js"]
    server_src_modules_reports_report_service_js["report.service.js"]
    server_src_modules_students_student_model_js["student.model.js"]
    server_src_modules_students_student_routes_js["student.routes.js"]
    server_src_modules_users_user_model_js["user.model.js"]
    server_src_modules_users_user_routes_js["user.routes.js"]
  end
  subgraph server_src_plugins["server/src/plugins"]
    server_src_plugins_auth_js["auth.js"]
    server_src_plugins_db_js["db.js"]
  end
  subgraph server_src_scripts["server/src/scripts"]
    server_src_scripts_seed_js["seed.js"]
  end
  subgraph server_src_server_js["server/src/server.js"]
    server_src_server_js["server.js"]
  end
  subgraph server_src_utils["server/src/utils"]
    server_src_utils_access_js["access.js"]
    server_src_utils_date_js["date.js"]
    server_src_utils_errors_js["errors.js"]
  end
  subgraph client_src_App_jsx["client/src/App.jsx"]
    client_src_App_jsx["App.jsx"]
  end
  subgraph client_src_api["client/src/api"]
    client_src_api_client_js["client.js"]
  end
  subgraph client_src_components["client/src/components"]
    client_src_components_ClassroomSelect_jsx["ClassroomSelect.jsx"]
    client_src_components_MiniBarChart_jsx["MiniBarChart.jsx"]
    client_src_components_RateProgress_jsx["RateProgress.jsx"]
  end
  subgraph client_src_context["client/src/context"]
    client_src_context_AuthContext_jsx["AuthContext.jsx"]
  end
  subgraph client_src_layouts["client/src/layouts"]
    client_src_layouts_MainLayout_jsx["MainLayout.jsx"]
  end
  subgraph client_src_main_jsx["client/src/main.jsx"]
    client_src_main_jsx["main.jsx"]
  end
  subgraph client_src_pages["client/src/pages"]
    client_src_pages_ClassroomsPage_jsx["ClassroomsPage.jsx"]
    client_src_pages_DashboardPage_jsx["DashboardPage.jsx"]
    client_src_pages_HomeworksPage_jsx["HomeworksPage.jsx"]
    client_src_pages_LessonsPage_jsx["LessonsPage.jsx"]
    client_src_pages_LoginPage_jsx["LoginPage.jsx"]
    client_src_pages_ProfilePage_jsx["ProfilePage.jsx"]
    client_src_pages_ReportsPage_jsx["ReportsPage.jsx"]
    client_src_pages_StudentDetailPage_jsx["StudentDetailPage.jsx"]
    client_src_pages_StudentsPage_jsx["StudentsPage.jsx"]
    client_src_pages_UsersPage_jsx["UsersPage.jsx"]
  end
  subgraph client_src_theme_js["client/src/theme.js"]
    client_src_theme_js["theme.js"]
  end
  server_src_app_js --> server_src_config_index_js
  server_src_app_js --> server_src_plugins_db_js
  server_src_app_js --> server_src_plugins_auth_js
  server_src_app_js --> server_src_modules_auth_auth_routes_js
  server_src_app_js --> server_src_modules_users_user_routes_js
  server_src_app_js --> server_src_modules_classrooms_classroom_routes_js
  server_src_app_js --> server_src_modules_students_student_routes_js
  server_src_app_js --> server_src_modules_homeworks_homework_routes_js
  server_src_app_js --> server_src_modules_lessons_lesson_routes_js
  server_src_app_js --> server_src_modules_reports_report_routes_js
  server_src_modules_auth_auth_routes_js --> server_src_modules_users_user_model_js
  server_src_modules_auth_auth_routes_js --> server_src_utils_errors_js
  server_src_modules_classrooms_classroom_routes_js --> server_src_modules_classrooms_classroom_model_js
  server_src_modules_classrooms_classroom_routes_js --> server_src_modules_students_student_model_js
  server_src_modules_classrooms_classroom_routes_js --> server_src_utils_access_js
  server_src_modules_classrooms_classroom_routes_js --> server_src_utils_errors_js
  server_src_modules_homeworks_homework_routes_js --> server_src_modules_homeworks_homework_model_js
  server_src_modules_homeworks_homework_routes_js --> server_src_modules_students_student_model_js
  server_src_modules_homeworks_homework_routes_js --> server_src_utils_access_js
  server_src_modules_homeworks_homework_routes_js --> server_src_utils_errors_js
  server_src_modules_lessons_lesson_routes_js --> server_src_modules_lessons_lesson_model_js
  server_src_modules_lessons_lesson_routes_js --> server_src_utils_access_js
  server_src_modules_lessons_lesson_routes_js --> server_src_utils_errors_js
  server_src_modules_lessons_lesson_routes_js --> server_src_utils_date_js
  server_src_modules_reports_report_routes_js --> server_src_modules_classrooms_classroom_model_js
  server_src_modules_reports_report_routes_js --> server_src_modules_students_student_model_js
  server_src_modules_reports_report_routes_js --> server_src_modules_homeworks_homework_model_js
  server_src_modules_reports_report_routes_js --> server_src_modules_lessons_lesson_model_js
  server_src_modules_reports_report_routes_js --> server_src_modules_users_user_model_js
  server_src_modules_reports_report_routes_js --> server_src_utils_access_js
  server_src_modules_reports_report_routes_js --> server_src_utils_errors_js
  server_src_modules_reports_report_routes_js --> server_src_utils_date_js
  server_src_modules_reports_report_routes_js --> server_src_modules_reports_report_service_js
  server_src_modules_reports_report_service_js --> server_src_modules_homeworks_homework_model_js
  server_src_modules_reports_report_service_js --> server_src_modules_students_student_model_js
  server_src_modules_reports_report_service_js --> server_src_modules_lessons_lesson_model_js
  server_src_modules_reports_report_service_js --> server_src_modules_classrooms_classroom_model_js
  server_src_modules_reports_report_service_js --> server_src_utils_date_js
  server_src_modules_students_student_routes_js --> server_src_modules_students_student_model_js
  server_src_modules_students_student_routes_js --> server_src_utils_access_js
  server_src_modules_students_student_routes_js --> server_src_utils_errors_js
  server_src_modules_users_user_routes_js --> server_src_modules_users_user_model_js
  server_src_modules_users_user_routes_js --> server_src_utils_errors_js
  server_src_plugins_auth_js --> server_src_config_index_js
  server_src_plugins_auth_js --> server_src_modules_users_user_model_js
  server_src_plugins_db_js --> server_src_config_index_js
  server_src_scripts_seed_js --> server_src_config_index_js
  server_src_scripts_seed_js --> server_src_modules_users_user_model_js
  server_src_scripts_seed_js --> server_src_modules_classrooms_classroom_model_js
  server_src_scripts_seed_js --> server_src_modules_students_student_model_js
  server_src_scripts_seed_js --> server_src_modules_homeworks_homework_model_js
  server_src_scripts_seed_js --> server_src_modules_lessons_lesson_model_js
  server_src_scripts_seed_js --> server_src_utils_date_js
  server_src_server_js --> server_src_app_js
  server_src_server_js --> server_src_config_index_js
  server_src_utils_access_js --> server_src_modules_classrooms_classroom_model_js
  server_src_utils_access_js --> server_src_utils_errors_js
  client_src_App_jsx --> client_src_context_AuthContext_jsx
  client_src_App_jsx --> client_src_layouts_MainLayout_jsx
  client_src_App_jsx --> client_src_pages_LoginPage_jsx
  client_src_App_jsx --> client_src_pages_DashboardPage_jsx
  client_src_App_jsx --> client_src_pages_UsersPage_jsx
  client_src_App_jsx --> client_src_pages_ClassroomsPage_jsx
  client_src_App_jsx --> client_src_pages_StudentsPage_jsx
  client_src_App_jsx --> client_src_pages_StudentDetailPage_jsx
  client_src_App_jsx --> client_src_pages_HomeworksPage_jsx
  client_src_App_jsx --> client_src_pages_LessonsPage_jsx
  client_src_App_jsx --> client_src_pages_ReportsPage_jsx
  client_src_App_jsx --> client_src_pages_ProfilePage_jsx
  client_src_components_ClassroomSelect_jsx --> client_src_api_client_js
  client_src_context_AuthContext_jsx --> client_src_api_client_js
  client_src_layouts_MainLayout_jsx --> client_src_context_AuthContext_jsx
  client_src_main_jsx --> client_src_App_jsx
  client_src_main_jsx --> client_src_context_AuthContext_jsx
  client_src_main_jsx --> client_src_theme_js
  client_src_pages_ClassroomsPage_jsx --> client_src_api_client_js
  client_src_pages_ClassroomsPage_jsx --> client_src_context_AuthContext_jsx
  client_src_pages_DashboardPage_jsx --> client_src_api_client_js
  client_src_pages_DashboardPage_jsx --> client_src_context_AuthContext_jsx
  client_src_pages_DashboardPage_jsx --> client_src_components_MiniBarChart_jsx
  client_src_pages_DashboardPage_jsx --> client_src_components_RateProgress_jsx
  client_src_pages_HomeworksPage_jsx --> client_src_api_client_js
  client_src_pages_HomeworksPage_jsx --> client_src_components_ClassroomSelect_jsx
  client_src_pages_LessonsPage_jsx --> client_src_api_client_js
  client_src_pages_LessonsPage_jsx --> client_src_theme_js
  client_src_pages_LessonsPage_jsx --> client_src_components_ClassroomSelect_jsx
  client_src_pages_LoginPage_jsx --> client_src_context_AuthContext_jsx
  client_src_pages_ProfilePage_jsx --> client_src_api_client_js
  client_src_pages_ReportsPage_jsx --> client_src_api_client_js
  client_src_pages_ReportsPage_jsx --> client_src_context_AuthContext_jsx
  client_src_pages_ReportsPage_jsx --> client_src_components_ClassroomSelect_jsx
  client_src_pages_ReportsPage_jsx --> client_src_components_RateProgress_jsx
  client_src_pages_ReportsPage_jsx --> client_src_components_MiniBarChart_jsx
  client_src_pages_StudentDetailPage_jsx --> client_src_api_client_js
  client_src_pages_StudentDetailPage_jsx --> client_src_theme_js
  client_src_pages_StudentDetailPage_jsx --> client_src_components_RateProgress_jsx
  client_src_pages_StudentsPage_jsx --> client_src_api_client_js
  client_src_pages_StudentsPage_jsx --> client_src_components_ClassroomSelect_jsx
  client_src_pages_UsersPage_jsx --> client_src_api_client_js
```

## En çok bağımlılık alan dosyalar

| Dosya | Kaç dosya kullanıyor |
|---|---|
| `client/src/api/client.js` | 11 |
| `server/src/utils/errors.js` | 8 |
| `client/src/context/AuthContext.jsx` | 7 |
| `server/src/modules/students/student.model.js` | 6 |
| `server/src/config/index.js` | 5 |
| `server/src/modules/users/user.model.js` | 5 |
| `server/src/modules/classrooms/classroom.model.js` | 5 |
| `server/src/utils/access.js` | 5 |
| `server/src/modules/homeworks/homework.model.js` | 4 |
| `server/src/modules/lessons/lesson.model.js` | 4 |
| `server/src/utils/date.js` | 4 |
| `client/src/components/ClassroomSelect.jsx` | 4 |
