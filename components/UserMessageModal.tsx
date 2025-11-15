import React, { useState } from 'react';
import { useUsers } from '../context/UsersContext';
import { useAuth } from '../context/AuthContext';
import { User } from '../types';
import Modal from './Modal';

interface UserMessageModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

const UserMessageModal: React.FC<UserMessageModalProps> = ({
  user,
  isOpen,
  onClose
}) => {
  const { logActivity } = useUsers();
  const { user: currentUser } = useAuth();
  const [messageType, setMessageType] = useState<'reminder' | 'warning' | 'info' | 'custom'>('info');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [isSending, setIsSending] = useState(false);

  const messageTemplates = {
    reminder: {
      subject: 'תזכורת - עדכון נתונים במערכת',
      message: 'שלום,\n\nזהו רק תזכורת ידידותית לעדכן את הנתונים במערכת.\nבמידה ויש צורך בעזרה, אנא פנה אלינו.\n\nבברכה,\nצוות ההנהלה'
    },
    warning: {
      subject: 'התראה - פעולה נדרשת',
      message: 'שלום,\n\nאנו מבקשים את תשומת לבך לעניין הדורש טיפול במערכת.\nאנא צור קשר לקבלת פרטים נוספים.\n\nבברכה,\nצוות ההנהלה'
    },
    info: {
      subject: 'עדכון מהמערכת',
      message: 'שלום,\n\nאנו רוצים לעדכן אותך בנושא הקשור לפעילותך במערכת.\n\nבברכה,\nצוות ההנהלה'
    }
  };

  const handleTemplateChange = (type: keyof typeof messageTemplates) => {
    setMessageType(type);
    if (type !== 'custom') {
      const template = messageTemplates[type];
      setSubject(template.subject);
      setMessage(template.message);
    }
  };

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      alert('אנא מלא את כל השדות הנדרשים');
      return;
    }

    setIsSending(true);
    
    try {
      // Simulate sending message (in real app, this would call an API)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Log the activity
      logActivity(
        'שליחת הודעה למשתמש',
        'message',
        user.id,
        `נשלחה הודעה בנושא: "${subject}" עם עדיפות ${priority === 'high' ? 'גבוהה' : priority === 'medium' ? 'בינונית' : 'נמוכה'}`
      );

      alert('ההודעה נשלחה בהצלחה!');
      onClose();
      
      // Reset form
      setSubject('');
      setMessage('');
      setMessageType('info');
      setPriority('medium');
      
    } catch (error) {
      console.error('Error sending message:', error);
      alert('שגיאה בשליחת ההודעה. אנא נסה שוב.');
    } finally {
      setIsSending(false);
    }
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`שליחת הודעה ל-${user.fullName || user.username}`}
      size="medium"
    >
      <div className="space-y-6">
        {/* Message Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">סוג הודעה</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleTemplateChange('info')}
              className={`p-3 text-center border rounded-lg transition-colors ${
                messageType === 'info'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="text-lg mb-1">ℹ️</div>
              <div className="text-sm font-medium">מידע כללי</div>
            </button>
            
            <button
              onClick={() => handleTemplateChange('reminder')}
              className={`p-3 text-center border rounded-lg transition-colors ${
                messageType === 'reminder'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="text-lg mb-1">⏰</div>
              <div className="text-sm font-medium">תזכורת</div>
            </button>
            
            <button
              onClick={() => handleTemplateChange('warning')}
              className={`p-3 text-center border rounded-lg transition-colors ${
                messageType === 'warning'
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="text-lg mb-1">⚠️</div>
              <div className="text-sm font-medium">אזהרה</div>
            </button>
            
            <button
              onClick={() => handleTemplateChange('custom')}
              className={`p-3 text-center border rounded-lg transition-colors ${
                messageType === 'custom'
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="text-lg mb-1">✏️</div>
              <div className="text-sm font-medium">מותאם אישית</div>
            </button>
          </div>
        </div>

        {/* Priority Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">עדיפות</label>
          <div className="flex space-x-3">
            {(['low', 'medium', 'high'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
                  priority === p
                    ? getPriorityColor(p)
                    : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {p === 'high' ? 'גבוהה' : p === 'medium' ? 'בינונית' : 'נמוכה'}
              </button>
            ))}
          </div>
        </div>

        {/* Subject Field */}
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
            נושא הודעה *
          </label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="הכנס נושא ההודעה..."
            required
          />
        </div>

        {/* Message Field */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
            תוכן ההודעה *
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="הכנס את תוכן ההודעה..."
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            {message.length}/500 תווים
          </p>
        </div>

        {/* Recipient Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">פרטי נמען</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>שם:</strong> {user.fullName || user.username}</p>
            <p><strong>משתמש:</strong> @{user.username}</p>
            {user.email && <p><strong>אימייל:</strong> {user.email}</p>}
            <p><strong>תפקיד:</strong> {user.role === 'Admin' ? 'מנהל' : 'משתמש'}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isSending}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            ביטול
          </button>
          <button
            onClick={handleSend}
            disabled={isSending || !subject.trim() || !message.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isSending ? (
              <>
                <svg className="animate-spin -mr-1 ml-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                שולח...
              </>
            ) : (
              'שלח הודעה'
            )}
          </button>
        </div>

        {/* Disclaimer */}
        <div className="text-xs text-gray-500 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          <p className="font-medium text-yellow-800 mb-1">⚠️ הערה חשובה:</p>
          <p>
            הודעה זו תירשם במערכת כפעילות של המנהל. 
            במערכת אמיתית, ההודעה תישלח גם באימייל או בהתראה במערכת.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default UserMessageModal;
