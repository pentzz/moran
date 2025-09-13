<?php
/*
 * מערכת ניהול משמרות
 * טימור - מערכת ניהול עובדים
 */

session_start();

// קבועים
define('EMPLOYEES_FILE', 'employees.json');
define('SHIFTS_FILE', 'shifts.json');
define('SETTINGS_FILE', 'settings.json');

// פונקציות עזר
function loadJSON($filename) {
    if (!file_exists($filename)) {
        return [];
    }
    $content = file_get_contents($filename);
    return json_decode($content, true) ?: [];
}

function saveJSON($filename, $data) {
    file_put_contents($filename, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

function addEmployee($name, $monthlySalary = null, $hourlyRate = null, $overtimeRate = null, $idNumber = null, $salaryType = 'monthly', $globalSalary = null) {
    $employees = loadJSON(EMPLOYEES_FILE);
    $id = uniqid();
    $employees[$id] = [
        'name' => $name,
        'id_number' => $idNumber,
        'salary_type' => $salaryType, // 'hourly' או 'global'
        'monthly_salary' => $monthlySalary,
        'hourly_rate' => $hourlyRate,
        'global_salary' => $globalSalary,
        'overtime_rate' => $overtimeRate,
        'created_at' => date('Y-m-d H:i:s')
    ];
    saveJSON(EMPLOYEES_FILE, $employees);
    return $id;
}

function addShift($employeeId, $date, $startTime, $endTime) {
    $shifts = loadJSON(SHIFTS_FILE);
    $shiftId = uniqid();
    
    // חישוב שעות עבודה
    $start = DateTime::createFromFormat('Y-m-d H:i', $date . ' ' . $startTime);
    $end = DateTime::createFromFormat('Y-m-d H:i', $date . ' ' . $endTime);
    
    // אם שעת הסיום לפני שעת ההתחלה, זה אומר שהמשמרת עברה לחצות
    if ($end < $start) {
        $end->modify('+1 day');
    }
    
    $hoursWorked = $start->diff($end)->h + ($start->diff($end)->i / 60);
    
    $shifts[$shiftId] = [
        'employee_id' => $employeeId,
        'date' => $date,
        'start_time' => $startTime,
        'end_time' => $endTime,
        'hours_worked' => round($hoursWorked, 2),
        'created_at' => date('Y-m-d H:i:s')
    ];
    
    saveJSON(SHIFTS_FILE, $shifts);
    return $shiftId;
}

// פונקציה לניקוי נתונים עבור CSV
function cleanCsvData($data) {
    // הסרת תווים בעייתיים
    $data = str_replace(['"', "\n", "\r"], ['""', ' ', ' '], $data);
    // אם יש פסיקים או רווחים, מקיף במירכאות
    if (strpos($data, ',') !== false || strpos($data, ' ') !== false) {
        $data = '"' . $data . '"';
    }
    return $data;
}

// פונקציה ליצירת שורת CSV
function createCsvRow($array) {
    $cleanedArray = array_map('cleanCsvData', $array);
    return implode(',', $cleanedArray) . "\n";
}

function exportToExcel($type, $employeeId = null, $month = null, $year = null) {
    $employees = loadJSON(EMPLOYEES_FILE);
    $shifts = loadJSON(SHIFTS_FILE);
    
    $month = $month ?: date('m');
    $year = $year ?: date('Y');
    
    // יצירת קובץ Excel HTML עם כיוון RTL ומסגרות
    $filename = 'דוח_משמרות_' . sprintf('%02d', $month) . '_' . $year . '.xls';
    
    header('Content-Type: application/vnd.ms-excel; charset=UTF-8');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Cache-Control: max-age=0');
    
    // BOM לזיהוי UTF-8 באקסל
    echo "\xEF\xBB\xBF";
    
    // התחלת HTML עם כיוון RTL וסטיילינג
    echo '<!DOCTYPE html>';
    echo '<html dir="rtl">';
    echo '<head>';
    echo '<meta charset="UTF-8">';
    echo '<style>';
    echo 'body { direction: rtl; font-family: Arial, sans-serif; }';
    echo 'table { border-collapse: collapse; width: 100%; direction: rtl; }';
    echo 'th, td { border: 1px solid #000; padding: 8px; text-align: right; }';
    echo '.header { background-color: #4a90e2; color: white; font-weight: bold; text-align: center; }';
    echo '.subheader { background-color: #e3f2fd; font-weight: bold; }';
    echo '.total { background-color: #fff3cd; font-weight: bold; }';
    echo '.overtime { background-color: #f8d7da; }';
    echo '.section-title { background-color: #d4edda; font-weight: bold; text-align: center; }';
    echo '</style>';
    echo '</head>';
    echo '<body>';
    
    $htmlContent = '';
    
    if ($type === 'employee' && $employeeId) {
        // דוח לפי עובד ספציפי - פורמט HTML
        $employee = $employees[$employeeId];
        $payData = calculatePay($employeeId, $month, $year);
        $monthNames = ['', 'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];
        
        // כותרת ראשית
        $htmlContent .= '<table>';
        $htmlContent .= '<tr><td colspan="8" class="header" style="font-size: 16px;">דוח עובד - ' . htmlspecialchars($employee['name']) . ' - ' . $monthNames[intval($month)] . ' ' . $year . '</td></tr>';
        $htmlContent .= '<tr><td colspan="8">&nbsp;</td></tr>';
        $htmlContent .= '</table><br>';
        
        // פרטי עובד
        $htmlContent .= '<table>';
        $htmlContent .= '<tr><td colspan="4" class="section-title">פרטי עובד</td></tr>';
        $htmlContent .= '<tr><td>שם מלא:</td><td>' . htmlspecialchars($employee['name']) . '</td><td>ת.ז.:</td><td>' . htmlspecialchars($employee['id_number'] ?? 'לא צוין') . '</td></tr>';
        $salaryTypeText = '';
        if ($employee['salary_type'] === 'global' || $employee['salary_type'] === 'monthly') {
            $salaryTypeText = 'שכר גלובאלי חודשי (21 יום)';
        } else {
            $salaryTypeText = 'שכר שעתי';
        }
        $htmlContent .= '<tr><td>סוג שכר:</td><td colspan="3">' . $salaryTypeText . '</td></tr>';
        
        if ($employee['salary_type'] === 'global' || $employee['salary_type'] === 'monthly') {
            $globalSalary = $employee['salary_type'] === 'monthly' ? $employee['monthly_salary'] : $employee['global_salary'];
            $htmlContent .= '<tr><td>שכר גלובאלי חודשי:</td><td>₪' . number_format($globalSalary, 0) . ' (21 יום)</td><td>שעות נוספות:</td><td>₪' . number_format($employee['overtime_rate'], 2) . ' לשעה (מעל 9 שעות ביום)</td></tr>';
        } else {
            $htmlContent .= '<tr><td>שכר שעתי:</td><td>₪' . number_format($employee['hourly_rate'], 2) . '</td><td>שעות נוספות:</td><td>₪' . number_format($employee['overtime_rate'], 2) . ' לשעה</td></tr>';
        }
        $htmlContent .= '</table><br>';
        
        // סיכום שכר
        $htmlContent .= '<table>';
        $htmlContent .= '<tr><td colspan="4" class="section-title">סיכום שכר חודשי</td></tr>';
        if ($employee['salary_type'] === 'global' || $employee['salary_type'] === 'monthly') {
            $daysWorked = count($payData['daily_hours']);
            $globalSalary = $employee['salary_type'] === 'monthly' ? $employee['monthly_salary'] : $employee['global_salary'];
            $htmlContent .= '<tr><td>שכר בסיס (יחסי):</td><td class="total">₪' . number_format($payData['base_salary'], 0) . '</td><td>תוספת שעות נוספות:</td><td class="overtime">₪' . number_format($payData['overtime_pay'], 2) . '</td></tr>';
            $htmlContent .= '<tr><td>ימים שעבד:</td><td>' . $daysWorked . ' מתוך 21</td><td>שכר גלובאלי חודשי מלא:</td><td>₪' . number_format($globalSalary, 0) . '</td></tr>';
        }
        $htmlContent .= '<tr><td>סה"כ שעות עבודה:</td><td>' . $payData['total_hours'] . '</td><td>שעות נוספות:</td><td class="overtime">' . $payData['overtime_hours'] . '</td></tr>';
        $htmlContent .= '<tr><td colspan="2" class="total">סה"כ שכר לתשלום:</td><td colspan="2" class="total" style="font-size: 16px;">₪' . number_format($payData['total_pay'], 2) . '</td></tr>';
        $htmlContent .= '</table><br>';
        
        // כותרת טבלת משמרות
        $htmlContent .= '<table>';
        $htmlContent .= '<tr><td colspan="8" class="section-title">פירוט משמרות יומי</td></tr>';
        $htmlContent .= '<tr class="header">';
        $htmlContent .= '<th>תאריך</th><th>יום בשבוע</th><th>שעת התחלה</th><th>שעת סיום</th><th>סה"כ שעות</th><th>שעות נוספות</th><th>שכר יומי</th><th>הערות</th>';
        $htmlContent .= '</tr>';
        
        // איסוף וסידור המשמרות לפי תאריך
        $monthlyShifts = [];
        foreach ($shifts as $shift) {
            if ($shift['employee_id'] === $employeeId) {
                $shiftDate = DateTime::createFromFormat('Y-m-d', $shift['date']);
                if ($shiftDate && $shiftDate->format('m') === sprintf('%02d', $month) && $shiftDate->format('Y') === $year) {
                    $monthlyShifts[] = $shift;
                }
            }
        }
        
        // סידור לפי תאריך
        usort($monthlyShifts, function($a, $b) {
            return strtotime($a['date']) - strtotime($b['date']);
        });
        
        foreach ($monthlyShifts as $shift) {
            $shiftDate = DateTime::createFromFormat('Y-m-d', $shift['date']);
            $dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
            $dayName = $dayNames[$shiftDate->format('w')];
            $overtime = max(0, $shift['hours_worked'] - 9);
            
            // חישוב שכר יומי
            $dailySalary = 0;
            if ($employee['salary_type'] === 'global' || $employee['salary_type'] === 'monthly') {
                $dailySalary = $overtime * $employee['overtime_rate']; // רק שעות נוספות
            } else {
                $regularHours = min($shift['hours_worked'], 8);
                $dailySalary = ($regularHours * $employee['hourly_rate']) + ($overtime * $employee['overtime_rate']);
            }
            
            $notes = '';
            if ($overtime > 0) {
                $notes = '+' . round($overtime, 2) . ' שעות נוספות';
            }
            if ($shiftDate->format('w') == 5) { // יום שישי
                $notes .= ($notes ? ' | ' : '') . 'יום שישי';
            }
            if ($shiftDate->format('w') == 6) { // שבת
                $notes .= ($notes ? ' | ' : '') . 'שבת';
            }
            
            $rowClass = $overtime > 0 ? 'overtime' : '';
            $htmlContent .= '<tr class="' . $rowClass . '">';
            $htmlContent .= '<td>' . $shiftDate->format('d/m/Y') . '</td>';
            $htmlContent .= '<td>' . $dayName . '</td>';
            $htmlContent .= '<td>' . $shift['start_time'] . '</td>';
            $htmlContent .= '<td>' . $shift['end_time'] . '</td>';
            $htmlContent .= '<td>' . $shift['hours_worked'] . '</td>';
            $htmlContent .= '<td>' . round($overtime, 2) . '</td>';
            $htmlContent .= '<td>₪' . number_format($dailySalary, 2) . '</td>';
            $htmlContent .= '<td>' . $notes . '</td>';
            $htmlContent .= '</tr>';
        }
        $htmlContent .= '</table>';
        
    } else {
        // דוח כללי חודשי - פורמט HTML
        $monthNames = ['', 'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];
        
        // כותרת ראשית
        $htmlContent .= '<table>';
        $htmlContent .= '<tr><td colspan="9" class="header" style="font-size: 18px;">דוח משמרות חודשי - ' . $monthNames[intval($month)] . ' ' . $year . '</td></tr>';
        $htmlContent .= '<tr><td colspan="9" class="header" style="font-size: 12px;">תאריך הפקה: ' . date('d/m/Y H:i') . '</td></tr>';
        $htmlContent .= '<tr><td colspan="9">&nbsp;</td></tr>';
        $htmlContent .= '</table><br>';
        
        // סיכום עובדים
        $htmlContent .= '<table>';
        $htmlContent .= '<tr><td colspan="9" class="section-title">סיכום שכר עובדים</td></tr>';
        $htmlContent .= '<tr class="header">';
        $htmlContent .= '<th>עובד</th><th>ת.ז.</th><th>סוג שכר</th><th>שכר בסיס</th><th>שעות נוספות</th><th>תוספת ש.נ.</th><th>סה"כ שעות</th><th>סה"כ לתשלום</th><th>הערות</th>';
        $htmlContent .= '</tr>';
        
        $totalMonthlyPay = 0;
        $totalMonthlyHours = 0;
        $totalOvertimeHours = 0;
        
        foreach ($employees as $empId => $emp) {
            $payData = calculatePay($empId, $month, $year);
            if ($payData && $payData['total_hours'] > 0) {
                $totalMonthlyPay += $payData['total_pay'];
                $totalMonthlyHours += $payData['total_hours'];
                $totalOvertimeHours += $payData['overtime_hours'];
                
                $notes = '';
                if ($emp['salary_type'] === 'global' || $emp['salary_type'] === 'monthly') {
                    $notes = 'שכר גלובאלי חודשי + ש.נ.';
                } else {
                    $notes = 'שכר שעתי';
                }
                
                $htmlContent .= '<tr>';
                $htmlContent .= '<td>' . htmlspecialchars($emp['name']) . '</td>';
                $htmlContent .= '<td>' . htmlspecialchars($emp['id_number'] ?? 'לא צוין') . '</td>';
                $salaryTypeDisplay = '';
                $baseSalaryDisplay = 0;
                if ($emp['salary_type'] === 'global' || $emp['salary_type'] === 'monthly') {
                    $salaryTypeDisplay = 'גלובאלי חודשי';
                    $baseSalaryDisplay = $emp['salary_type'] === 'monthly' ? $emp['monthly_salary'] : $emp['global_salary'];
                } else {
                    $salaryTypeDisplay = 'שעתי';
                    $baseSalaryDisplay = 0;
                }
                $htmlContent .= '<td>' . $salaryTypeDisplay . '</td>';
                $htmlContent .= '<td>₪' . number_format($baseSalaryDisplay, 0) . '</td>';
                $htmlContent .= '<td>' . round($payData['overtime_hours'], 2) . '</td>';
                $htmlContent .= '<td>₪' . number_format($payData['overtime_pay'] ?? 0, 2) . '</td>';
                $htmlContent .= '<td>' . $payData['total_hours'] . '</td>';
                $htmlContent .= '<td class="total">₪' . number_format($payData['total_pay'], 2) . '</td>';
                $htmlContent .= '<td>' . $notes . '</td>';
                $htmlContent .= '</tr>';
            }
        }
        
        // סיכום כללי
        $htmlContent .= '<tr class="total">';
        $htmlContent .= '<td colspan="6"><strong>סה"כ לתשלום לכל העובדים:</strong></td>';
        $htmlContent .= '<td><strong>' . round($totalMonthlyHours, 2) . '</strong></td>';
        $htmlContent .= '<td><strong>₪' . number_format($totalMonthlyPay, 2) . '</strong></td>';
        $htmlContent .= '<td><strong>' . round($totalOvertimeHours, 2) . ' ש.נ.</strong></td>';
        $htmlContent .= '</tr>';
        $htmlContent .= '</table><br>';
        
        // פירוט משמרות יומי
        $htmlContent .= '<table>';
        $htmlContent .= '<tr><td colspan="9" class="section-title">פירוט משמרות לפי תאריכים</td></tr>';
        $htmlContent .= '<tr class="header">';
        $htmlContent .= '<th>תאריך</th><th>יום</th><th>עובד</th><th>התחלה</th><th>סיום</th><th>סה"כ שעות</th><th>ש. נוספות</th><th>שכר יומי</th><th>הערות</th>';
        $htmlContent .= '</tr>';
        
        // איסוף וסידור המשמרות לפי תאריך
        $monthlyShifts = [];
        foreach ($shifts as $shift) {
            $shiftDate = DateTime::createFromFormat('Y-m-d', $shift['date']);
            if ($shiftDate && $shiftDate->format('m') === sprintf('%02d', $month) && $shiftDate->format('Y') === $year) {
                $monthlyShifts[] = $shift;
            }
        }
        
        // סידור לפי תאריך
        usort($monthlyShifts, function($a, $b) {
            return strtotime($a['date']) - strtotime($b['date']);
        });
        
        foreach ($monthlyShifts as $shift) {
            $shiftDate = DateTime::createFromFormat('Y-m-d', $shift['date']);
            $employee = $employees[$shift['employee_id']] ?? ['name' => 'עובד לא קיים', 'salary_type' => 'hourly', 'hourly_rate' => 0, 'overtime_rate' => 0];
            $dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
            $dayName = $dayNames[$shiftDate->format('w')];
            $overtime = max(0, $shift['hours_worked'] - 9);
            
            // חישוב שכר יומי
            $dailySalary = 0;
            if ($employee['salary_type'] === 'global' || $employee['salary_type'] === 'monthly') {
                $dailySalary = $overtime * $employee['overtime_rate']; // רק שעות נוספות לעובד גלובאלי
            } else {
                $regularHours = min($shift['hours_worked'], 8);
                $dailySalary = ($regularHours * $employee['hourly_rate']) + ($overtime * $employee['overtime_rate']);
            }
            
            $notes = '';
            if ($overtime > 0) {
                $notes = '+' . round($overtime, 2) . ' ש.נ.';
            }
            if ($shiftDate->format('w') == 5) { // יום שישי
                $notes .= ($notes ? ' | ' : '') . 'שישי';
            }
            if ($shiftDate->format('w') == 6) { // שבת
                $notes .= ($notes ? ' | ' : '') . 'שבת';
            }
            
            $rowClass = $overtime > 0 ? 'overtime' : '';
            
            $htmlContent .= '<tr class="' . $rowClass . '">';
            $htmlContent .= '<td>' . $shiftDate->format('d/m/Y') . '</td>';
            $htmlContent .= '<td>' . $dayName . '</td>';
            $htmlContent .= '<td>' . htmlspecialchars($employee['name']) . '</td>';
            $htmlContent .= '<td>' . $shift['start_time'] . '</td>';
            $htmlContent .= '<td>' . $shift['end_time'] . '</td>';
            $htmlContent .= '<td>' . $shift['hours_worked'] . '</td>';
            $htmlContent .= '<td>' . round($overtime, 2) . '</td>';
            $htmlContent .= '<td>₪' . number_format($dailySalary, 2) . '</td>';
            $htmlContent .= '<td>' . $notes . '</td>';
            $htmlContent .= '</tr>';
        }
        $htmlContent .= '</table>';
    }
    
    // הוצאת התוכן
    echo $htmlContent;
    echo '</body></html>';
    exit;
}

function calculatePay($employeeId, $month = null, $year = null) {
    $employees = loadJSON(EMPLOYEES_FILE);
    $shifts = loadJSON(SHIFTS_FILE);
    
    if (!isset($employees[$employeeId])) {
        return null;
    }
    
    $employee = $employees[$employeeId];
    $month = $month ?: date('m');
    $year = $year ?: date('Y');
    
    $totalHours = 0;
    $dailyHours = []; // למעקב אחר שעות יומיות
    $totalPay = 0;
    $regularHours = 0;
    $overtimeHours = 0;
    $overtimePay = 0;
    
    // איסוף שעות לפי תאריכים
    foreach ($shifts as $shift) {
        if ($shift['employee_id'] === $employeeId) {
            $shiftDate = DateTime::createFromFormat('Y-m-d', $shift['date']);
            if ($shiftDate && $shiftDate->format('m') === sprintf('%02d', $month) && $shiftDate->format('Y') === $year) {
                $date = $shift['date'];
                if (!isset($dailyHours[$date])) {
                    $dailyHours[$date] = 0;
                }
                $dailyHours[$date] += $shift['hours_worked'];
                $totalHours += $shift['hours_worked'];
            }
        }
    }
    
    // חישוב שכר לפי סוג העובד
    if ($employee['salary_type'] === 'global' || $employee['salary_type'] === 'monthly') {
        // עובד שכר גלובאלי או חודשי - מבוסס על 21 יום
        if ($employee['salary_type'] === 'monthly') {
            // תמיכה בעובדים קיימים מסוג monthly
            $globalSalary = $employee['monthly_salary'];
        } else {
            $globalSalary = $employee['global_salary'];
        }
        
        $daysWorked = count($dailyHours);
        $expectedDays = 21;
        
        // חישוב שכר בסיס יחסי למספר הימים שעבד
        if ($daysWorked > 0) {
            $baseSalary = ($globalSalary / $expectedDays) * $daysWorked;
        } else {
            $baseSalary = 0;
        }
        
        // חישוב שעות נוספות - מעל 9 שעות ביום
        foreach ($dailyHours as $date => $hours) {
            if ($hours > 9) {
                $dailyOvertime = $hours - 9;
                $overtimeHours += $dailyOvertime;
                $overtimePay += $dailyOvertime * $employee['overtime_rate'];
            }
        }
        
        $totalPay = $baseSalary + $overtimePay;
        $regularHours = $totalHours - $overtimeHours;
        
    } else {
        // עובד שכר שעה
        if ($totalHours <= 186) {
            $regularHours = $totalHours;
        } else {
            $regularHours = 186;
            $overtimeHours = $totalHours - 186;
        }
        $totalPay = ($regularHours * $employee['hourly_rate']) + ($overtimeHours * $employee['overtime_rate']);
    }
    
    return [
        'employee' => $employee,
        'total_hours' => $totalHours,
        'regular_hours' => $regularHours,
        'overtime_hours' => $overtimeHours,
        'overtime_pay' => $overtimePay,
        'base_salary' => ($employee['salary_type'] === 'global' || $employee['salary_type'] === 'monthly') ? $baseSalary : 0,
        'total_pay' => $totalPay,
        'daily_hours' => $dailyHours,
        'month' => $month,
        'year' => $year
    ];
}

// טיפול בבקשות POST
if ($_POST) {
    if (isset($_POST['action'])) {
        switch ($_POST['action']) {
            case 'add_employee':
                $salaryType = $_POST['salary_type'] ?? 'hourly';
                if ($salaryType === 'global') {
                    $id = addEmployee($_POST['name'], null, null, floatval($_POST['overtime_rate']), $_POST['id_number'] ?? null, 'global', floatval($_POST['global_salary']));
                } else {
                    $id = addEmployee($_POST['name'], null, floatval($_POST['hourly_rate']), floatval($_POST['overtime_rate']), $_POST['id_number'] ?? null, 'hourly');
                }
                $_SESSION['message'] = "עובד נוסף בהצלחה (ID: $id)";
                break;
                
            case 'add_shift':
                $shiftId = addShift($_POST['employee_id'], $_POST['date'], $_POST['start_time'], $_POST['end_time']);
                $_SESSION['message'] = "משמרת נוספה בהצלחה";
                break;
                
            case 'delete_shift':
                $shifts = loadJSON(SHIFTS_FILE);
                unset($shifts[$_POST['shift_id']]);
                saveJSON(SHIFTS_FILE, $shifts);
                $_SESSION['message'] = "משמרת נמחקה בהצלחה";
                break;
                
            case 'edit_shift':
                $shifts = loadJSON(SHIFTS_FILE);
                $shiftId = $_POST['shift_id'];
                
                if (isset($shifts[$shiftId])) {
                    $shifts[$shiftId]['date'] = $_POST['date'];
                    $shifts[$shiftId]['start_time'] = $_POST['start_time'];
                    $shifts[$shiftId]['end_time'] = $_POST['end_time'];
                    
                    // חישוב שעות עבודה מחדש
                    $start = DateTime::createFromFormat('Y-m-d H:i', $_POST['date'] . ' ' . $_POST['start_time']);
                    $end = DateTime::createFromFormat('Y-m-d H:i', $_POST['date'] . ' ' . $_POST['end_time']);
                    
                    if ($end < $start) {
                        $end->modify('+1 day');
                    }
                    
                    $hoursWorked = $start->diff($end)->h + ($start->diff($end)->i / 60);
                    $shifts[$shiftId]['hours_worked'] = round($hoursWorked, 2);
                    
                    saveJSON(SHIFTS_FILE, $shifts);
                    $_SESSION['message'] = "משמרת עודכנה בהצלחה";
                }
                break;
                
            case 'export_excel':
                $exportType = $_POST['export_type'] ?? 'monthly';
                $employeeId = $_POST['export_employee_id'] ?? null;
                $month = $_POST['export_month'] ?? date('m');
                $year = $_POST['export_year'] ?? date('Y');
                
                if ($exportType === 'employee' && $employeeId) {
                    exportToExcel('employee', $employeeId, $month, $year);
                } else {
                    exportToExcel('monthly', null, $month, $year);
                }
                break;
        }
        header('Location: ' . $_SERVER['PHP_SELF']);
        exit;
    }
}

// אתחול נתונים ראשוניים אם הקבצים לא קיימים
if (!file_exists(EMPLOYEES_FILE) || empty(loadJSON(EMPLOYEES_FILE))) {
    // הוספת יוסי ברוכיאל לפי הסכם העבודה - שכר גלובאלי חודשי 9,000₪ נטו + 50₪ לשעות נוספות מעל 9 שעות ביום
    $yossiId = addEmployee('יוסי ברוכיאל', null, null, 50, '211567540', 'global', 9000);
    
    // הוספת המשמרות הראשוניות - אוגוסט 2025
    $initialShifts = [
        ['2025-08-03', '07:00', '18:16'],
        ['2025-08-04', '07:00', '17:06'],
        ['2025-08-05', '07:00', '19:16'],
        ['2025-08-06', '07:00', '20:46'],
        ['2025-08-07', '07:00', '18:30'],
        ['2025-08-10', '07:00', '19:57'],
        ['2025-08-11', '07:00', '20:01'],
        ['2025-08-12', '07:00', '20:15'],
        ['2025-08-19', '07:00', '21:25'],
        ['2025-08-20', '07:00', '20:50']
    ];
    
    foreach ($initialShifts as $shift) {
        addShift($yossiId, $shift[0], $shift[1], $shift[2]);
    }
}

$employees = loadJSON(EMPLOYEES_FILE);
$shifts = loadJSON(SHIFTS_FILE);
?>

<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>טימור - מערכת ניהול משמרות</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
            color: white;
            padding: 20px;
            text-align: center;
            position: relative;
        }
        
        .logo {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: white;
            margin: 0 auto 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            background-image: url('logo.jpg');
            background-size: cover;
            background-position: center;
        }
        
        .logo-fallback {
            font-size: 24px;
            font-weight: bold;
            color: #4a90e2;
        }
        
        h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .subtitle {
            font-size: 1.1em;
            opacity: 0.9;
        }
        
        .main-content {
            padding: 30px;
        }
        
        .tabs {
            display: flex;
            border-bottom: 2px solid #e0e0e0;
            margin-bottom: 30px;
        }
        
        .tab {
            padding: 15px 25px;
            background: #f5f5f5;
            border: none;
            cursor: pointer;
            font-size: 16px;
            border-radius: 8px 8px 0 0;
            margin-left: 5px;
            transition: all 0.3s ease;
        }
        
        .tab.active {
            background: #4a90e2;
            color: white;
        }
        
        .tab-content {
            display: none;
        }
        
        .tab-content.active {
            display: block;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
            color: #333;
        }
        
        input, select {
            width: 100%;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 16px;
            transition: border-color 0.3s ease;
        }
        
        input:focus, select:focus {
            outline: none;
            border-color: #4a90e2;
        }
        
        .btn {
            background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
            color: white;
            padding: 12px 25px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            transition: transform 0.2s ease;
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(74, 144, 226, 0.3);
        }
        
        .btn-danger {
            background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
        }
        
        .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            border-radius: 8px;
            overflow: hidden;
        }
        
        .table th {
            background: #4a90e2;
            color: white;
            padding: 15px;
            text-align: right;
        }
        
        .table td {
            padding: 12px 15px;
            border-bottom: 1px solid #e0e0e0;
        }
        
        .table tr:nth-child(even) {
            background-color: #f8f9fa;
        }
        
        .table tr:hover {
            background-color: #e3f2fd;
        }
        
        .message {
            background: #d4edda;
            color: #155724;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            border: 1px solid #c3e6cb;
        }
        
        .card {
            background: white;
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 20px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            border: 1px solid #e0e0e0;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
        }
        
        .stat-number {
            font-size: 2.5em;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .stat-label {
            font-size: 1.1em;
            opacity: 0.9;
        }
        
        .export-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .export-section {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 12px;
            border: 2px solid #e9ecef;
            position: relative;
        }
        
        .export-section h4 {
            color: #4a90e2;
            margin-bottom: 10px;
            font-size: 1.3em;
        }
        
        .export-section p {
            color: #666;
            margin-bottom: 20px;
            line-height: 1.5;
        }
        
        .export-btn {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            font-size: 1.1em;
            padding: 15px 30px;
            margin-top: 15px;
        }
        
        .export-btn:hover {
            background: linear-gradient(135deg, #218838 0%, #1abc9c 100%);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(40, 167, 69, 0.3);
        }
        
        .export-info {
            background: linear-gradient(135deg, #17a2b8 0%, #007bff 100%);
            color: white;
            padding: 25px;
            border-radius: 12px;
            margin-top: 30px;
        }
        
        .export-info h4 {
            margin-bottom: 15px;
            font-size: 1.2em;
        }
        
        .export-info ul {
            list-style: none;
            padding-right: 0;
        }
        
        .export-info li {
            padding: 8px 0;
            border-bottom: 1px solid rgba(255,255,255,0.2);
        }
        
        .export-info li:last-child {
            border-bottom: none;
        }
        
        /* רספונסיביות משופרת */
        @media (max-width: 1200px) {
            .stats-grid {
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            }
            
            .container {
                margin: 10px;
            }
        }
        
        @media (max-width: 992px) {
            .tabs {
                flex-wrap: wrap;
                justify-content: center;
            }
            
            .tab {
                flex: 1;
                min-width: 120px;
                margin: 2px;
                text-align: center;
            }
            
            .table {
                font-size: 14px;
            }
            
            .main-content {
                padding: 20px;
            }
        }
        
        @media (max-width: 768px) {
            .tabs {
                flex-direction: column;
            }
            
            .tab {
                margin: 2px 0;
                border-radius: 8px;
                width: 100%;
            }
            
            .main-content {
                padding: 15px;
            }
            
            h1 {
                font-size: 2em;
            }
            
            .stats-grid {
                grid-template-columns: 1fr;
                gap: 15px;
            }
            
            .stat-number {
                font-size: 2em;
            }
            
            .form-group {
                margin-bottom: 15px;
            }
            
            input, select {
                font-size: 16px; /* מונע זום באייפון */
            }
            
            .table {
                font-size: 12px;
            }
            
            .table th, .table td {
                padding: 8px 5px;
                word-wrap: break-word;
            }
            
            .export-section {
                padding: 20px;
            }
            
            .export-btn {
                width: 100%;
                padding: 15px;
                font-size: 1em;
            }
        }
        
        @media (max-width: 480px) {
            body {
                padding: 10px;
            }
            
            .container {
                margin: 0;
                border-radius: 8px;
            }
            
            .header {
                padding: 15px;
            }
            
            .logo {
                width: 60px;
                height: 60px;
            }
            
            h1 {
                font-size: 1.8em;
            }
            
            .subtitle {
                font-size: 1em;
            }
            
            .main-content {
                padding: 10px;
            }
            
            .card {
                padding: 15px;
                margin-bottom: 15px;
            }
            
            .table {
                display: block;
                overflow-x: auto;
                white-space: nowrap;
            }
            
            .btn {
                padding: 12px 20px;
                font-size: 14px;
            }
            
            .form-group label {
                font-size: 14px;
            }
            
            .export-info {
                padding: 15px;
            }
            
            .export-info li {
                font-size: 14px;
            }
        }
        
        /* תמיכה במצב נוף בטאבלט */
        @media (max-width: 1024px) and (orientation: landscape) {
            .tabs {
                flex-wrap: nowrap;
                overflow-x: auto;
                -webkit-overflow-scrolling: touch;
            }
            
            .tab {
                flex-shrink: 0;
                min-width: 100px;
            }
        }
        
        /* שיפורים לנגישות */
        @media (prefers-reduced-motion: reduce) {
            .btn, .tab, .card {
                transition: none;
            }
        }
        
        /* תמיכה במסכים קטנים מאוד */
        @media (max-width: 320px) {
            .logo {
                width: 50px;
                height: 50px;
            }
            
            h1 {
                font-size: 1.5em;
            }
            
            .tab {
                font-size: 14px;
                padding: 10px 15px;
            }
        }
        
        /* עיצוב מודאל */
        .modal {
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.5);
            backdrop-filter: blur(5px);
        }
        
        .modal-content {
            background-color: white;
            margin: 5% auto;
            padding: 30px;
            border-radius: 15px;
            width: 90%;
            max-width: 500px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            position: relative;
            animation: modalSlideIn 0.3s ease-out;
        }
        
        @keyframes modalSlideIn {
            from {
                opacity: 0;
                transform: translateY(-50px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .close {
            color: #aaa;
            float: left;
            font-size: 28px;
            font-weight: bold;
            position: absolute;
            top: 15px;
            left: 20px;
            cursor: pointer;
            transition: color 0.3s;
        }
        
        .close:hover {
            color: #000;
        }
        
        .modal-buttons {
            display: flex;
            gap: 10px;
            justify-content: center;
            margin-top: 20px;
        }
        
        .modal-buttons .btn {
            flex: 1;
            max-width: 150px;
        }
        
        @media (max-width: 768px) {
            .modal-content {
                margin: 10% auto;
                width: 95%;
                padding: 20px;
            }
            
            .modal-buttons {
                flex-direction: column;
            }
            
            .modal-buttons .btn {
                max-width: none;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">
                <div class="logo-fallback">טימור</div>
            </div>
            <h1>מערכת ניהול משמרות</h1>
            <div class="subtitle">ניהול עובדים ושעות עבודה מתקדם</div>
        </div>
        
        <div class="main-content">
            <?php if (isset($_SESSION['message'])): ?>
                <div class="message">
                    <?php echo $_SESSION['message']; unset($_SESSION['message']); ?>
                </div>
            <?php endif; ?>
            
            <div class="tabs">
                <button class="tab active" onclick="openTab(event, 'dashboard')">דשבורד</button>
                <button class="tab" onclick="openTab(event, 'employees')">עובדים</button>
                <button class="tab" onclick="openTab(event, 'shifts')">משמרות</button>
                <button class="tab" onclick="openTab(event, 'reports')">דוחות</button>
                <button class="tab" onclick="openTab(event, 'export')">ייצוא לאקסל</button>
            </div>
            
            <!-- דשבורד -->
            <div id="dashboard" class="tab-content active">
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-number"><?php echo count($employees); ?></div>
                        <div class="stat-label">עובדים במערכת</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number"><?php echo count($shifts); ?></div>
                        <div class="stat-label">סה"כ משמרות</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">
                            <?php 
                            $thisMonth = 0;
                            foreach ($shifts as $shift) {
                                $shiftDate = DateTime::createFromFormat('Y-m-d', $shift['date']);
                                if ($shiftDate && $shiftDate->format('m') === date('m')) {
                                    $thisMonth++;
                                }
                            }
                            echo $thisMonth;
                            ?>
                        </div>
                        <div class="stat-label">משמרות החודש</div>
                    </div>
                </div>
                
                <div class="card">
                    <h3>משמרות אחרונות</h3>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>עובד</th>
                                <th>תאריך</th>
                                <th>שעת התחלה</th>
                                <th>שעת סיום</th>
                                <th>שעות עבודה</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php 
                            $recentShifts = array_slice(array_reverse($shifts), 0, 5);
                            foreach ($recentShifts as $shift): 
                                $employee = $employees[$shift['employee_id']] ?? ['name' => 'עובד לא קיים'];
                            ?>
                            <tr>
                                <td><?php echo htmlspecialchars($employee['name']); ?></td>
                                <td><?php echo date('d/m/Y', strtotime($shift['date'])); ?></td>
                                <td><?php echo $shift['start_time']; ?></td>
                                <td><?php echo $shift['end_time']; ?></td>
                                <td><?php echo $shift['hours_worked']; ?> שעות</td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- עובדים -->
            <div id="employees" class="tab-content">
                <div class="card">
                    <h3>הוספת עובד חדש</h3>
                    <form method="POST">
                        <input type="hidden" name="action" value="add_employee">
                        <div class="form-group">
                            <label>שם העובד:</label>
                            <input type="text" name="name" required>
                        </div>
                        <div class="form-group">
                            <label>תעודת זהות:</label>
                            <input type="text" name="id_number" pattern="[0-9]{9}" title="9 ספרות">
                        </div>
                        <div class="form-group">
                            <label>סוג שכר:</label>
                            <select name="salary_type" id="salary_type" onchange="toggleSalaryFields()" required>
                                <option value="hourly">שכר שעתי</option>
                                <option value="global">שכר גלובאלי חודשי</option>
                            </select>
                        </div>
                        <div class="form-group" id="hourly_rate_group">
                            <label>שכר לשעה (₪):</label>
                            <input type="number" step="0.01" name="hourly_rate" id="hourly_rate">
                        </div>
                        <div class="form-group" id="global_salary_group" style="display: none;">
                            <label>שכר גלובאלי חודשי (₪) - עבור 21 יום:</label>
                            <input type="number" step="0.01" name="global_salary" id="global_salary">
                        </div>
                        <div class="form-group">
                            <label>שכר שעות נוספות (₪):</label>
                            <input type="number" step="0.01" name="overtime_rate" required>
                        </div>
                        <button type="submit" class="btn">הוסף עובד</button>
                    </form>
                </div>
                
                <div class="card">
                    <h3>רשימת עובדים</h3>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>שם</th>
                                <th>ת.ז.</th>
                                <th>סוג שכר</th>
                                <th>שכר בסיס</th>
                                <th>שעות נוספות</th>
                                <th>תאריך הוספה</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($employees as $id => $employee): ?>
                            <tr>
                                <td><?php echo htmlspecialchars($employee['name']); ?></td>
                                <td><?php echo htmlspecialchars($employee['id_number'] ?? 'לא צוין'); ?></td>
                                <td>
                                    <?php 
                                    if ($employee['salary_type'] === 'global' || $employee['salary_type'] === 'monthly') {
                                        echo 'שכר גלובאלי חודשי';
                                    } else {
                                        echo 'שכר שעתי';
                                    }
                                    ?>
                                </td>
                                <td>
                                    <?php if ($employee['salary_type'] === 'global' || $employee['salary_type'] === 'monthly'): ?>
                                        <?php 
                                        $globalSalary = $employee['salary_type'] === 'monthly' ? $employee['monthly_salary'] : $employee['global_salary'];
                                        ?>
                                        ₪<?php echo number_format($globalSalary ?? 0, 0); ?> (21 יום)
                                    <?php else: ?>
                                        ₪<?php echo number_format($employee['hourly_rate'] ?? 0, 2); ?> לשעה
                                    <?php endif; ?>
                                </td>
                                <td>₪<?php echo number_format($employee['overtime_rate'] ?? 0, 2); ?> לשעה</td>
                                <td><?php echo date('d/m/Y', strtotime($employee['created_at'])); ?></td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- משמרות -->
            <div id="shifts" class="tab-content">
                <div class="card">
                    <h3>הוספת משמרת חדשה</h3>
                    <form method="POST">
                        <input type="hidden" name="action" value="add_shift">
                        <div class="form-group">
                            <label>עובד:</label>
                            <select name="employee_id" required>
                                <option value="">בחר עובד</option>
                                <?php foreach ($employees as $id => $employee): ?>
                                <option value="<?php echo $id; ?>"><?php echo htmlspecialchars($employee['name']); ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>תאריך:</label>
                            <input type="date" name="date" required>
                        </div>
                        <div class="form-group">
                            <label>שעת התחלה:</label>
                            <input type="time" name="start_time" required>
                        </div>
                        <div class="form-group">
                            <label>שעת סיום:</label>
                            <input type="time" name="end_time" required>
                        </div>
                        <button type="submit" class="btn">הוסף משמרת</button>
                    </form>
                </div>
                
                <div class="card">
                    <h3>כל המשמרות</h3>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>עובד</th>
                                <th>תאריך</th>
                                <th>שעת התחלה</th>
                                <th>שעת סיום</th>
                                <th>שעות עבודה</th>
                                <th>פעולות</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach (array_reverse($shifts) as $shiftId => $shift): 
                                $employee = $employees[$shift['employee_id']] ?? ['name' => 'עובד לא קיים'];
                            ?>
                            <tr>
                                <td><?php echo htmlspecialchars($employee['name']); ?></td>
                                <td><?php echo date('d/m/Y', strtotime($shift['date'])); ?></td>
                                <td><?php echo $shift['start_time']; ?></td>
                                <td><?php echo $shift['end_time']; ?></td>
                                <td><?php echo $shift['hours_worked']; ?> שעות</td>
                                <td>
                                    <button onclick="editShift('<?php echo $shiftId; ?>', '<?php echo $shift['date']; ?>', '<?php echo $shift['start_time']; ?>', '<?php echo $shift['end_time']; ?>')" class="btn" style="background: #ffc107; margin-left: 5px;">ערוך</button>
                                    <form method="POST" style="display: inline;">
                                        <input type="hidden" name="action" value="delete_shift">
                                        <input type="hidden" name="shift_id" value="<?php echo $shiftId; ?>">
                                        <button type="submit" class="btn btn-danger" onclick="return confirm('האם אתה בטוח שברצונך למחוק משמרת זו?')">מחק</button>
                                    </form>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
                
                <!-- מודאל עריכת משמרת -->
                <div id="editModal" class="modal" style="display: none;">
                    <div class="modal-content">
                        <span class="close" onclick="closeEditModal()">&times;</span>
                        <h3>עריכת משמרת</h3>
                        <form id="editForm" method="POST">
                            <input type="hidden" name="action" value="edit_shift">
                            <input type="hidden" name="shift_id" id="edit_shift_id">
                            
                            <div class="form-group">
                                <label>תאריך:</label>
                                <input type="date" name="date" id="edit_date" required>
                            </div>
                            
                            <div class="form-group">
                                <label>שעת התחלה:</label>
                                <input type="time" name="start_time" id="edit_start_time" required>
                            </div>
                            
                            <div class="form-group">
                                <label>שעת סיום:</label>
                                <input type="time" name="end_time" id="edit_end_time" required>
                            </div>
                            
                            <div class="modal-buttons">
                                <button type="submit" class="btn">שמור שינויים</button>
                                <button type="button" class="btn btn-danger" onclick="closeEditModal()">ביטול</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            
            <!-- דוחות -->
            <div id="reports" class="tab-content">
                <div class="card">
                    <h3>דוח שכר חודשי</h3>
                    <?php foreach ($employees as $empId => $emp): 
                        // מציג דוח לאוגוסט 2025 (חודש 8) אם יש נתונים, אחרת החודש הנוכחי
                        $payData2025 = calculatePay($empId, '08', '2025');
                        $payDataCurrent = calculatePay($empId, date('m'), date('Y'));
                        
                        // מעדיף את נתוני 2025 אם יש
                        $payData = ($payData2025 && $payData2025['total_hours'] > 0) ? $payData2025 : $payDataCurrent;
                        $displayDate = ($payData2025 && $payData2025['total_hours'] > 0) ? '08/2025' : date('m/Y');
                        
                        if ($payData && $payData['total_hours'] > 0):
                    ?>
                    <div class="card">
                        <h4><?php echo htmlspecialchars($emp['name']); ?> - <?php echo $displayDate; ?></h4>
                        <?php if ($emp['salary_type'] === 'global' || $emp['salary_type'] === 'monthly'): ?>
                            <?php 
                            $daysWorked = count($payData['daily_hours']);
                            $globalSalary = $emp['salary_type'] === 'monthly' ? $emp['monthly_salary'] : $emp['global_salary'];
                            ?>
                            <p><strong>שכר גלובאלי חודשי מלא:</strong> ₪<?php echo number_format($globalSalary, 0); ?> (21 יום)</p>
                            <p><strong>ימים שעבד:</strong> <?php echo $daysWorked; ?> מתוך 21</p>
                            <p><strong>שכר בסיס (יחסי):</strong> ₪<?php echo number_format($payData['base_salary'] ?? 0, 0); ?></p>
                            <p><strong>סה"כ שעות עבודה:</strong> <?php echo $payData['total_hours'] ?? 0; ?> שעות</p>
                            <p><strong>שעות נוספות (מעל 9 שעות ביום):</strong> <?php echo $payData['overtime_hours'] ?? 0; ?> שעות</p>
                            <p><strong>תוספת שעות נוספות:</strong> ₪<?php echo number_format($payData['overtime_pay'] ?? 0, 2); ?></p>
                            <p><strong>סה"כ שכר:</strong> ₪<?php echo number_format($payData['total_pay'] ?? 0, 2); ?></p>
                            
                            <h5>פירוט שעות יומי:</h5>
                            <ul style="margin-top: 10px;">
                                <?php foreach ($payData['daily_hours'] as $date => $hours): ?>
                                <li><?php echo date('d/m/Y', strtotime($date)); ?>: <?php echo $hours; ?> שעות 
                                    <?php if ($hours > 9): ?>
                                        <span style="color: #e74c3c;">(+<?php echo $hours - 9; ?> שעות נוספות)</span>
                                    <?php endif; ?>
                                </li>
                                <?php endforeach; ?>
                            </ul>
                        <?php else: ?>
                            <p><strong>סה"כ שעות עבודה:</strong> <?php echo $payData['total_hours'] ?? 0; ?> שעות</p>
                            <p><strong>שעות רגילות:</strong> <?php echo $payData['regular_hours'] ?? 0; ?> שעות</p>
                            <p><strong>שעות נוספות:</strong> <?php echo $payData['overtime_hours'] ?? 0; ?> שעות</p>
                            <p><strong>סה"כ שכר:</strong> ₪<?php echo number_format($payData['total_pay'] ?? 0, 2); ?></p>
                        <?php endif; ?>
                    </div>
                    <?php endif; endforeach; ?>
                </div>
            </div>
            
            <!-- ייצוא לאקסל -->
            <div id="export" class="tab-content">
                <div class="card">
                    <h3>ייצוא דוחות לאקסל</h3>
                    <p>בחר את סוג הדוח שברצונך לייצא למעקב הנהלת חשבונות ולניהול השכר</p>
                    
                    <form method="POST" style="margin-bottom: 30px;">
                        <input type="hidden" name="action" value="export_excel">
                        
                        <div class="export-grid">
                            <div class="export-section">
                                <h4>🏢 דוח חודשי כללי</h4>
                                <p>דוח מפורט של כל העובדים לחודש נבחר - מתאים להנהלת חשבונות</p>
                                
                                <div class="form-group">
                                    <label>חודש:</label>
                                    <select name="export_month" required>
                                        <?php for ($i = 1; $i <= 12; $i++): ?>
                                        <option value="<?php echo sprintf('%02d', $i); ?>" <?php echo ($i == 8) ? 'selected' : ''; ?>>
                                            <?php echo sprintf('%02d', $i); ?>
                                        </option>
                                        <?php endfor; ?>
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label>שנה:</label>
                                    <select name="export_year" required>
                                        <option value="2024">2024</option>
                                        <option value="2025" selected>2025</option>
                                        <option value="2026">2026</option>
                                    </select>
                                </div>
                                
                                <input type="hidden" name="export_type" value="monthly">
                                <button type="submit" class="btn export-btn">📊 ייצא דוח חודשי</button>
                            </div>
                        </div>
                    </form>
                    
                    <form method="POST">
                        <input type="hidden" name="action" value="export_excel">
                        
                        <div class="export-grid">
                            <div class="export-section">
                                <h4>👤 דוח עובד ספציפי</h4>
                                <p>דוח מפורט לעובד אחד כולל פירוט משמרות יומי - מתאים לשכר אישי</p>
                                
                                <div class="form-group">
                                    <label>עובד:</label>
                                    <select name="export_employee_id" required>
                                        <option value="">בחר עובד</option>
                                        <?php foreach ($employees as $id => $emp): ?>
                                        <option value="<?php echo $id; ?>"><?php echo htmlspecialchars($emp['name']); ?></option>
                                        <?php endforeach; ?>
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label>חודש:</label>
                                    <select name="export_month" required>
                                        <?php for ($i = 1; $i <= 12; $i++): ?>
                                        <option value="<?php echo sprintf('%02d', $i); ?>" <?php echo ($i == 8) ? 'selected' : ''; ?>>
                                            <?php echo sprintf('%02d', $i); ?>
                                        </option>
                                        <?php endfor; ?>
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label>שנה:</label>
                                    <select name="export_year" required>
                                        <option value="2024">2024</option>
                                        <option value="2025" selected>2025</option>
                                        <option value="2026">2026</option>
                                    </select>
                                </div>
                                
                                <input type="hidden" name="export_type" value="employee">
                                <button type="submit" class="btn export-btn">📋 ייצא דוח עובד</button>
                            </div>
                        </div>
                    </form>
                    
                    <div class="export-info">
                        <h4>📌 מידע על הדוחות:</h4>
                        <ul>
                            <li><strong>דוח חודשי כללי:</strong> כולל סיכום כל העובדים, חישוב שכר מלא ופירוט משמרות</li>
                            <li><strong>דוח עובד ספציפי:</strong> מפורט לעובד אחד עם פרטי משמרות יום יום</li>
                            <li><strong>פורמט:</strong> קובץ Excel (.xls) עם תמיכה מלאה בעברית</li>
                            <li><strong>תוכן:</strong> שעות עבודה, שעות נוספות, חישוב שכר וסיכומים</li>
                            <li><strong>שימוש:</strong> מתאים להעברה להנהלת חשבונות ולתשלום שכר</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        function openTab(evt, tabName) {
            var i, tabcontent, tabs;
            tabcontent = document.getElementsByClassName("tab-content");
            for (i = 0; i < tabcontent.length; i++) {
                tabcontent[i].classList.remove("active");
            }
            tabs = document.getElementsByClassName("tab");
            for (i = 0; i < tabs.length; i++) {
                tabs[i].classList.remove("active");
            }
            document.getElementById(tabName).classList.add("active");
            evt.currentTarget.classList.add("active");
        }
        
        // הגדרת תאריך ברירת מחדל לתאריך של היום
        document.addEventListener('DOMContentLoaded', function() {
            const dateInput = document.querySelector('input[name="date"]');
            if (dateInput) {
                dateInput.value = new Date().toISOString().split('T')[0];
            }
        });
        
        // פונקציה לניהול שדות שכר
        function toggleSalaryFields() {
            const salaryType = document.getElementById('salary_type').value;
            const hourlyGroup = document.getElementById('hourly_rate_group');
            const globalGroup = document.getElementById('global_salary_group');
            const hourlyInput = document.getElementById('hourly_rate');
            const globalInput = document.getElementById('global_salary');
            
            // הסתרת כל השדות
            hourlyGroup.style.display = 'none';
            globalGroup.style.display = 'none';
            hourlyInput.removeAttribute('required');
            globalInput.removeAttribute('required');
            
            if (salaryType === 'global') {
                globalGroup.style.display = 'block';
                globalInput.setAttribute('required', 'required');
            } else {
                hourlyGroup.style.display = 'block';
                hourlyInput.setAttribute('required', 'required');
            }
        }
        
        // פונקציות עריכת משמרת
        function editShift(shiftId, date, startTime, endTime) {
            document.getElementById('edit_shift_id').value = shiftId;
            document.getElementById('edit_date').value = date;
            document.getElementById('edit_start_time').value = startTime;
            document.getElementById('edit_end_time').value = endTime;
            document.getElementById('editModal').style.display = 'block';
        }
        
        function closeEditModal() {
            document.getElementById('editModal').style.display = 'none';
        }
        
        // סגירת מודאל עם לחיצה על הרקע
        window.onclick = function(event) {
            const modal = document.getElementById('editModal');
            if (event.target === modal) {
                closeEditModal();
            }
        }
        
        // סגירת מודאל עם ESC
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                closeEditModal();
            }
        });
    </script>
</body>
</html>
