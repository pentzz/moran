<?php
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
                'role' => 'admin',
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
                'role' => 'user',
                'fullName' => 'ליטל ב',
                'email' => null,
                'createdAt' => date('c'),
                'lastLogin' => null,
                'isActive' => true
            ],
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
        // Auth endpoints
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
            
        // Users endpoints
        case 'getUsers':
            $users = readJsonFile('users.json');
            echo json_encode($users);
            break;
            
        case 'createUser':
            if ($method === 'POST') {
                $input = json_decode(file_get_contents('php://input'), true);
                $users = readJsonFile('users.json');
                
                // Check if username already exists
                foreach ($users as $user) {
                    if ($user['username'] === $input['username']) {
                        http_response_code(400);
                        echo json_encode(['error' => 'שם משתמש כבר קיים']);
                        exit;
                    }
                }
                
                $newUser = $input;
                $newUser['id'] = generateId();
                $newUser['createdAt'] = date('c');
                $newUser['lastLogin'] = null;
                $newUser['isActive'] = true;
                
                $users[] = $newUser;
                writeJsonFile('users.json', $users);
                echo json_encode($newUser);
            }
            break;
            
        case 'updateUser':
            if ($method === 'PUT') {
                $input = json_decode(file_get_contents('php://input'), true);
                $userId = $_GET['id'] ?? '';
                $users = readJsonFile('users.json');
                
                foreach ($users as &$user) {
                    if ($user['id'] === $userId) {
                        $user = array_merge($user, $input);
                        $user['updatedAt'] = date('c');
                        break;
                    }
                }
                
                writeJsonFile('users.json', $users);
                echo json_encode(['success' => true]);
            }
            break;
            
        case 'deleteUser':
            if ($method === 'DELETE') {
                $userId = $_GET['id'] ?? '';
                $users = readJsonFile('users.json');
                
                $users = array_filter($users, function($user) use ($userId) {
                    return $user['id'] !== $userId || $user['role'] === 'admin';
                });
                
                writeJsonFile('users.json', array_values($users));
                echo json_encode(['success' => true]);
            }
            break;
            
        // Activity logs endpoints
        case 'getActivityLogs':
            $logs = readJsonFile('activity-logs.json');
            echo json_encode($logs);
            break;
            
        case 'addActivityLog':
            if ($method === 'POST') {
                $input = json_decode(file_get_contents('php://input'), true);
                $logs = readJsonFile('activity-logs.json');
                
                $newLog = [
                    'id' => generateId(),
                    'userId' => $input['userId'],
                    'action' => $input['action'],
                    'entityType' => $input['entityType'],
                    'entityId' => $input['entityId'],
                    'details' => $input['details'],
                    'timestamp' => date('c')
                ];
                
                $logs[] = $newLog;
                writeJsonFile('activity-logs.json', $logs);
                echo json_encode($newLog);
            }
            break;
            
        // Settings endpoints
        case 'getSettings':
            $settings = readJsonFile('settings.json');
            echo json_encode($settings);
            break;
            
        case 'updateSettings':
            if ($method === 'PUT') {
                $input = json_decode(file_get_contents('php://input'), true);
                $settings = readJsonFile('settings.json');
                $settings = array_merge($settings, $input);
                $settings['updatedAt'] = date('c');
                writeJsonFile('settings.json', $settings);
                echo json_encode($settings);
            }
            break;
            
        // User Settings endpoints
        case 'getUserSettings':
            $userId = $_GET['userId'] ?? '';
            $userSettings = readJsonFile('user-settings.json');
            $userSetting = null;
            
            foreach ($userSettings as $setting) {
                if ($setting['userId'] === $userId) {
                    $userSetting = $setting;
                    break;
                }
            }
            
            if (!$userSetting) {
                // Create default user settings
                $userSetting = [
                    'id' => generateId(),
                    'userId' => $userId,
                    'taxRate' => 0,
                    'taxAmount' => 0,
                    'vatRate' => 18,
                    'companyName' => '',
                    'companyAddress' => '',
                    'companyPhone' => '',
                    'companyEmail' => '',
                    'defaultCategories' => [],
                    'defaultSuppliers' => [],
                    'updatedAt' => date('c'),
                    'updatedBy' => $userId
                ];
                $userSettings[] = $userSetting;
                writeJsonFile('user-settings.json', $userSettings);
            }
            
            echo json_encode($userSetting);
            break;
            
        case 'updateUserSettings':
            if ($method === 'PUT') {
                $input = json_decode(file_get_contents('php://input'), true);
                $userId = $_GET['userId'] ?? '';
                $userSettings = readJsonFile('user-settings.json');
                
                $found = false;
                foreach ($userSettings as &$setting) {
                    if ($setting['userId'] === $userId) {
                        $setting = array_merge($setting, $input);
                        $setting['updatedAt'] = date('c');
                        $found = true;
                        break;
                    }
                }
                
                if (!$found) {
                    $newSetting = array_merge($input, [
                        'id' => generateId(),
                        'userId' => $userId,
                        'updatedAt' => date('c'),
                        'updatedBy' => $userId
                    ]);
                    $userSettings[] = $newSetting;
                }
                
                writeJsonFile('user-settings.json', $userSettings);
                echo json_encode(['success' => true]);
            }
            break;
            
        // User Profile endpoints
        case 'getUserProfile':
            $userId = $_GET['userId'] ?? '';
            $userProfiles = readJsonFile('user-profiles.json');
            $userProfile = null;
            
            foreach ($userProfiles as $profile) {
                if ($profile['userId'] === $userId) {
                    $userProfile = $profile;
                    break;
                }
            }
            
            if (!$userProfile) {
                // Create default user profile
                $userProfile = [
                    'id' => generateId(),
                    'userId' => $userId,
                    'fullName' => '',
                    'email' => '',
                    'phone' => '',
                    'address' => '',
                    'bio' => '',
                    'profilePicture' => '',
                    'preferences' => [
                        'theme' => 'light',
                        'language' => 'he',
                        'notifications' => true,
                        'emailNotifications' => true
                    ],
                    'updatedAt' => date('c'),
                    'updatedBy' => $userId
                ];
                $userProfiles[] = $userProfile;
                writeJsonFile('user-profiles.json', $userProfiles);
            }
            
            echo json_encode($userProfile);
            break;
            
        case 'updateUserProfile':
            if ($method === 'PUT') {
                $input = json_decode(file_get_contents('php://input'), true);
                $userId = $_GET['userId'] ?? '';
                $userProfiles = readJsonFile('user-profiles.json');
                
                $found = false;
                foreach ($userProfiles as &$profile) {
                    if ($profile['userId'] === $userId) {
                        $profile = array_merge($profile, $input);
                        $profile['updatedAt'] = date('c');
                        $found = true;
                        break;
                    }
                }
                
                if (!$found) {
                    $newProfile = array_merge($input, [
                        'id' => generateId(),
                        'userId' => $userId,
                        'updatedAt' => date('c'),
                        'updatedBy' => $userId
                    ]);
                    $userProfiles[] = $newProfile;
                }
                
                writeJsonFile('user-profiles.json', $userProfiles);
                echo json_encode(['success' => true]);
            }
            break;
            
        // Projects endpoints  
        case 'getProjects':
            $projects = readJsonFile('projects.json');
            
            // Migrate old projects to new structure
            $needsMigration = false;
            foreach ($projects as &$project) {
                if (!isset($project['milestones'])) {
                    $project['milestones'] = [];
                    $needsMigration = true;
                }
                
                // Migrate milestones to include percentage
                if (isset($project['milestones'])) {
                    foreach ($project['milestones'] as &$milestone) {
                        if (!isset($milestone['percentage'])) {
                            $milestone['percentage'] = $project['contractAmount'] > 0 
                                ? round(($milestone['amount'] / $project['contractAmount']) * 100, 2)
                                : 0;
                            $needsMigration = true;
                        }
                    }
                }
                
                if (!isset($project['isArchived'])) {
                    $project['isArchived'] = false;
                    $needsMigration = true;
                }
                if (!isset($project['createdAt'])) {
                    $project['createdAt'] = date('c');
                    $needsMigration = true;
                }
                
                // Migrate incomes to new structure
                if (isset($project['incomes'])) {
                    foreach ($project['incomes'] as &$income) {
                        if (!isset($income['status'])) {
                            $income['status'] = 'paid';
                            $needsMigration = true;
                        }
                        if (!isset($income['paymentDate'])) {
                            $income['paymentDate'] = $income['date'] ?? date('Y-m-d');
                            $needsMigration = true;
                        }
                        if (!isset($income['actualPaymentDate'])) {
                            $income['actualPaymentDate'] = null;
                            $needsMigration = true;
                        }
                        if (!isset($income['partialPayments'])) {
                            $income['partialPayments'] = [];
                            $needsMigration = true;
                        }
                    }
                }
                
                // Migrate expenses to new structure
                if (isset($project['expenses'])) {
                    foreach ($project['expenses'] as &$expense) {
                        if (!isset($expense['subcategoryId'])) {
                            $expense['subcategoryId'] = null;
                            $needsMigration = true;
                        }
                        if (!isset($expense['additions'])) {
                            $expense['additions'] = 0;
                            $needsMigration = true;
                        }
                        if (!isset($expense['exceptions'])) {
                            $expense['exceptions'] = 0;
                            $needsMigration = true;
                        }
                        if (!isset($expense['dailyWorkers'])) {
                            $expense['dailyWorkers'] = 0;
                            $needsMigration = true;
                        }
                        if (!isset($expense['notes'])) {
                            $expense['notes'] = '';
                            $needsMigration = true;
                        }
                        if (!isset($expense['invoiceReceived'])) {
                            $expense['invoiceReceived'] = false;
                            $needsMigration = true;
                        }
                    }
                }
            }
            
            // Save migrated data
            if ($needsMigration) {
                writeJsonFile('projects.json', $projects);
            }
            
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
            
        case 'deleteProject':
            if ($method === 'DELETE') {
                $projectId = $_GET['id'] ?? '';
                $projects = readJsonFile('projects.json');
                
                $projects = array_filter($projects, function($project) use ($projectId) {
                    return $project['id'] !== $projectId;
                });
                
                writeJsonFile('projects.json', array_values($projects));
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
            
        case 'createCategory':
            if ($method === 'POST') {
                $input = json_decode(file_get_contents('php://input'), true);
                $categories = readJsonFile('categories.json');
                $newCategory = $input;
                $newCategory['id'] = generateId();
                $newCategory['subcategories'] = $newCategory['subcategories'] ?? [];
                $categories[] = $newCategory;
                writeJsonFile('categories.json', $categories);
                echo json_encode($newCategory);
            }
            break;
            
        case 'updateCategory':
            if ($method === 'PUT') {
                $input = json_decode(file_get_contents('php://input'), true);
                $categoryId = $_GET['id'] ?? '';
                $categories = readJsonFile('categories.json');
                
                foreach ($categories as &$category) {
                    if ($category['id'] === $categoryId) {
                        $category = array_merge($category, $input);
                        break;
                    }
                }
                
                writeJsonFile('categories.json', $categories);
                echo json_encode(['success' => true]);
            }
            break;
            
        case 'deleteCategory':
            if ($method === 'DELETE') {
                $categoryId = $_GET['id'] ?? '';
                $categories = readJsonFile('categories.json');
                
                $categories = array_filter($categories, function($category) use ($categoryId) {
                    return $category['id'] !== $categoryId;
                });
                
                writeJsonFile('categories.json', array_values($categories));
                echo json_encode(['success' => true]);
            }
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
            
        case 'createSupplier':
            if ($method === 'POST') {
                $input = json_decode(file_get_contents('php://input'), true);
                $suppliers = readJsonFile('suppliers.json');
                $newSupplier = $input;
                $newSupplier['id'] = generateId();
                $newSupplier['createdAt'] = date('c');
                $suppliers[] = $newSupplier;
                writeJsonFile('suppliers.json', $suppliers);
                echo json_encode($newSupplier);
            }
            break;
            
        case 'updateSupplier':
            if ($method === 'PUT') {
                $input = json_decode(file_get_contents('php://input'), true);
                $supplierId = $_GET['id'] ?? '';
                $suppliers = readJsonFile('suppliers.json');
                
                foreach ($suppliers as &$supplier) {
                    if ($supplier['id'] === $supplierId) {
                        $supplier = array_merge($supplier, $input);
                        break;
                    }
                }
                
                writeJsonFile('suppliers.json', $suppliers);
                echo json_encode(['success' => true]);
            }
            break;
            
        case 'deleteSupplier':
            if ($method === 'DELETE') {
                $supplierId = $_GET['id'] ?? '';
                $suppliers = readJsonFile('suppliers.json');
                
                $suppliers = array_filter($suppliers, function($supplier) use ($supplierId) {
                    return $supplier['id'] !== $supplierId;
                });
                
                writeJsonFile('suppliers.json', array_values($suppliers));
                echo json_encode(['success' => true]);
            }
            break;
            
        case 'getNotifications':
            if ($method === 'GET') {
                $userId = $_GET['userId'] ?? '';
                $notifications = readJsonFile('notifications.json');
                
                // Filter notifications for the user
                $userNotifications = array_filter($notifications, function($notification) use ($userId) {
                    return in_array($userId, $notification['targetUsers']) || 
                           empty($notification['targetUsers']); // Global notifications
                });
                
                echo json_encode(array_values($userNotifications));
            }
            break;
            
        case 'addNotification':
            if ($method === 'POST') {
                $input = json_decode(file_get_contents('php://input'), true);
                $notifications = readJsonFile('notifications.json');
                $newNotification = $input;
                $newNotification['id'] = generateId();
                $newNotification['createdAt'] = date('c');
                $newNotification['isRead'] = [];
                $notifications[] = $newNotification;
                writeJsonFile('notifications.json', $notifications);
                echo json_encode($newNotification);
            }
            break;
            
        case 'markNotificationAsRead':
            if ($method === 'PUT') {
                $input = json_decode(file_get_contents('php://input'), true);
                $notificationId = $_GET['id'] ?? '';
                $userId = $input['userId'] ?? '';
                $notifications = readJsonFile('notifications.json');
                
                foreach ($notifications as &$notification) {
                    if ($notification['id'] === $notificationId) {
                        $notification['isRead'][$userId] = true;
                        break;
                    }
                }
                
                writeJsonFile('notifications.json', $notifications);
                echo json_encode(['success' => true]);
            }
            break;
            
        case 'markAllNotificationsAsRead':
            if ($method === 'PUT') {
                $input = json_decode(file_get_contents('php://input'), true);
                $userId = $input['userId'] ?? '';
                $notifications = readJsonFile('notifications.json');
                
                foreach ($notifications as &$notification) {
                    if (in_array($userId, $notification['targetUsers']) || empty($notification['targetUsers'])) {
                        $notification['isRead'][$userId] = true;
                    }
                }
                
                writeJsonFile('notifications.json', $notifications);
                echo json_encode(['success' => true]);
            }
            break;
            
        default:
            http_response_code(404);
            echo json_encode(['error' => 'Action not found']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>