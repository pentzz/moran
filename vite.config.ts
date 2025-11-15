import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import fs from 'fs';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      publicDir: 'public',
      build: {
        rollupOptions: {
          // הוספת plugin להעתקת נתוני JSON
          plugins: [{
            name: 'copy-data-files',
            writeBundle: async () => {
              console.log('📋 Creating complete dist package...');
              
              const distDir = path.resolve(__dirname, 'dist');
              
              try {
                // 1. העתקת נתוני JSON
                const sourceDataDir = path.resolve(__dirname, 'public/data');
                const targetDataDir = path.join(distDir, 'data');
                
                if (!fs.existsSync(targetDataDir)) {
                  fs.mkdirSync(targetDataDir, { recursive: true });
                }
                
                const dataFiles = ['projects.json', 'categories.json', 'suppliers.json', 'users.json', 'notifications.json'];
                
                for (const file of dataFiles) {
                  const sourcePath = path.join(sourceDataDir, file);
                  const targetPath = path.join(targetDataDir, file);
                  
                  if (fs.existsSync(sourcePath)) {
                    fs.copyFileSync(sourcePath, targetPath);
                    console.log(`✅ Copied ${file} to dist/data/`);
                  } else {
                    // יצירת קובץ ברירת מחדל אם לא קיים
                    let defaultContent = '[]';
                    if (file === 'categories.json') {
                      defaultContent = JSON.stringify([
                        { id: '1', name: 'חומרי בנייה' },
                        { id: '2', name: 'קבלני משנה' },
                        { id: '3', name: 'חשמל' }
                      ], null, 2);
                    } else if (file === 'suppliers.json') {
                      defaultContent = JSON.stringify([
                        { 
                          id: '1', 
                          name: 'ספק כללי', 
                          description: 'ספק ברירת מחדל',
                          createdAt: new Date().toISOString()
                        }
                      ], null, 2);
                    }
                    
                    fs.writeFileSync(targetPath, defaultContent);
                    console.log(`📝 Created default ${file} in dist/data/`);
                  }
                }
                
                // 2. העתקת api.php המלא עם כל הפונקציונליות
                const sourceApiPath = path.resolve(__dirname, 'api_full.php');
                const targetApiPath = path.join(distDir, 'api.php');
                
                if (fs.existsSync(sourceApiPath)) {
                  // העתק את הקובץ הקיים עם כל הפונקציונליות
                  fs.copyFileSync(sourceApiPath, targetApiPath);
                  console.log(`✅ Copied full api.php with all functionality`);
                } else {
                  // יצירת קובץ PHP בסיסי אם אין קובץ קיים
                  const phpBackend = `<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$dataDir = __DIR__ . '/data/';

function readJsonFile($filename) {
    global $dataDir;
    $filepath = $dataDir . $filename;
    if (file_exists($filepath)) {
        $content = file_get_contents($filepath);
        return json_decode($content, true) ?: [];
    }
    return [];
}

function writeJsonFile($filename, $data) {
    global $dataDir;
    if (!is_dir($dataDir)) {
        mkdir($dataDir, 0755, true);
    }
    $filepath = $dataDir . $filename;
    return file_put_contents($filepath, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

function generateId() {
    return 'id_' . uniqid() . '_' . mt_rand(1000, 9999);
}

function initializeDefaultData() {
    // Initialize users with super admin
    $users = readJsonFile('users.json');
    if (empty($users)) {
        $users = [
            [
                'id' => 'super-admin',
                'username' => 'moran',
                'password' => 'M123456',
                'role' => 'Admin',
                'fullName' => 'מורן מרקוביץ',
                'email' => 'moran@mechubarot.com',
                'createdAt' => date('c'),
                'lastLogin' => null,
                'isActive' => true
            ],
            [
                'id' => 'legacy-user',
                'username' => 'litalb',
                'password' => 'Papi2009',
                'role' => 'User',
                'fullName' => 'ליטל ב',
                'email' => null,
                'createdAt' => date('c'),
                'lastLogin' => null,
                'isActive' => true
            ]
        ];
        writeJsonFile('users.json', $users);
    }
    
    // Initialize activity logs
    $activityLogs = readJsonFile('activity-logs.json');
    if (empty($activityLogs)) {
        writeJsonFile('activity-logs.json', []);
    }
    
    // Initialize system settings
    $settings = readJsonFile('settings.json');
    if (empty($settings)) {
        $settings = [
            'id' => 'settings',
            'taxRate' => 0,
            'taxAmount' => 0, 
            'vatRate' => 18,
            'companyName' => 'מחוברות - ניהול מורן מרקוביץ',
            'companyAddress' => '',
            'companyPhone' => '',
            'companyEmail' => 'moran@mechubarot.com',
            'updatedAt' => date('c'),
            'updatedBy' => 'system'
        ];
        writeJsonFile('settings.json', $settings);
    }
}

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

// Initialize default data on first run
initializeDefaultData();

try {
    switch ($action) {
        // Auth and user management
        case 'login':
            if ($method === 'POST') {
                $input = json_decode(file_get_contents('php://input'), true);
                $username = $input['username'] ?? '';
                $password = $input['password'] ?? '';
                
                $users = readJsonFile('users.json');
                $user = null;
                
                foreach ($users as &$u) {
                    if ($u['username'] === $username && $u['password'] === $password && $u['isActive']) {
                        $u['lastLogin'] = date('c');
                        $user = $u;
                        break;
                    }
                }
                
                if ($user) {
                    writeJsonFile('users.json', $users);
                    echo json_encode([
                        'success' => true,
                        'token' => 'authenticated_' . $user['id'],
                        'user' => $user
                    ]);
                } else {
                    http_response_code(401);
                    echo json_encode(['success' => false, 'message' => 'שם משתמש או סיסמה שגויים']);
                }
            }
            break;
            
        case 'getProjects':
            $projects = readJsonFile('projects.json');
            echo json_encode($projects);
            break;
            
        case 'createProject':
            if ($method === 'POST') {
                $input = json_decode(file_get_contents('php://input'), true);
                $projects = readJsonFile('projects.json');
                $newProject = $input;
                $newProject['id'] = generateId();
                $newProject['incomes'] = [];
                $newProject['expenses'] = [];
                $newProject['milestones'] = [];
                $newProject['isArchived'] = false;
                $newProject['createdAt'] = date('c');
                $projects[] = $newProject;
                writeJsonFile('projects.json', $projects);
                echo json_encode($newProject);
            }
            break;
            
        case 'updateProject':
            if ($method === 'PUT') {
                $input = json_decode(file_get_contents('php://input'), true);
                $projectId = $_GET['id'] ?? '';
                $projects = readJsonFile('projects.json');
                
                foreach ($projects as &$project) {
                    if ($project['id'] === $projectId) {
                        $project = array_merge($project, $input);
                        $project['updatedAt'] = date('c');
                        break;
                    }
                }
                
                writeJsonFile('projects.json', $projects);
                echo json_encode(['success' => true]);
            }
            break;
            
        case 'getCategories':
            $categories = readJsonFile('categories.json');
            if (empty($categories)) {
                $categories = [
                    ['id' => '1', 'name' => 'חומרי בנייה', 'subcategories' => []],
                    ['id' => '2', 'name' => 'קבלני משנה', 'subcategories' => []],
                    ['id' => '3', 'name' => 'חשמל', 'subcategories' => []]
                ];
                writeJsonFile('categories.json', $categories);
            }
            echo json_encode($categories);
            break;
            
        case 'getSuppliers':
            $suppliers = readJsonFile('suppliers.json');
            if (empty($suppliers)) {
                $suppliers = [
                    [
                        'id' => '1',
                        'name' => 'ספק כללי',
                        'description' => 'ספק ברירת מחדל',
                        'createdAt' => date('c')
                    ]
                ];
                writeJsonFile('suppliers.json', $suppliers);
            }
            echo json_encode($suppliers);
            break;
            
        default:
            http_response_code(404);
            echo json_encode(['error' => 'Action not found']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>`;
                  
                  fs.writeFileSync(targetApiPath, phpBackend);
                  console.log(`✅ Created basic api.php`);
                }
                
                // 6. העתקת קבצים נוספים
                const additionalFiles = ['logo.png', 'mechubarot_logo_M.png'];
                for (const file of additionalFiles) {
                  const sourcePath = path.resolve(__dirname, file);
                  if (fs.existsSync(sourcePath)) {
                    fs.copyFileSync(sourcePath, path.join(distDir, file));
                    console.log(`✅ Copied ${file}`);
                  }
                }
                
                // 3. יצירת README לפריסה PHP פשוטה
                const distReadme = `# מערכת ניהול פרויקטים לקבלן - פריסה PHP פשוטה

## 🚀 פריסה פשוטה ללא הרצת שרת!

זוהי מערכת שלמה שעובדת עם PHP ללא צורך בהתקנות או הרצת שרתים.

### פריסה לשרת אירוח:
1. העלה את כל הקבצים לשרת אירוח PHP (cPanel/FTP)
2. זהו! המערכת עובדת מיד

### מה כלול:
- ✅ אפליקציית React בנויה
- ✅ קובץ PHP פשוט (api.php)
- ✅ כל הנתונים הקיימים בקבצי JSON
- ✅ שמירה ישירה לקבצי JSON בשרת
- ✅ נגישות ממכשירים שונים

### יתרונות:
- 📊 נתונים משותפים בין כל המשתמשים
- 💾 שמירה ישירה לקבצי JSON בשרת
- 🔗 עובד ממכל דפדפן ומכשיר
- 🌐 עובד בכל שרת אירוח PHP
- 💰 זול - עובד בחבילות אירוח רגילות
- 🔐 התחברות: litalb / Papi2009

### דרישות שרת:
- PHP 7.0+ (יש בכל שרת אירוח)
- הרשאות כתיבה לתיקיית data/

### שרתי אירוח נתמכים:
- ✅ כל שרת אירוח עם PHP (GoDaddy, Bluehost, וכו')
- ✅ cPanel hosting
- ✅ שרת אירוח ישראלי כלשהו
- ✅ XAMPP/WAMP למבחן מקומי

**כל השינויים נשמרים בקבצי JSON ונראים לכל המשתמשים!**
**אין צורך בהתקנות או הרצת שרת - פשוט העלה את הקבצים!**
`;
                
                fs.writeFileSync(path.join(distDir, 'README.md'), distReadme);
                console.log(`✅ Created dist/README.md`);
                
                console.log('🎉 Complete dist package created successfully!');
                console.log(`📂 Directory: ${distDir}`);
                console.log('🚀 Ready for deployment - just copy the dist folder to your server!');
                
              } catch (error) {
                console.error('❌ Error creating dist package:', error);
              }
            }
          }]
        }
      }
    };
});
