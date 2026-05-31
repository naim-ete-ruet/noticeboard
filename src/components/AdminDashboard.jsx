// src/components/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function AdminDashboard({ onLogout, darkMode }) {
  const [notices, setNotices] = useState([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('CT Results');
  const [teacherId, setTeacherId] = useState('');
  const [file, setFile] = useState(null);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    const { data } = await supabase.from('notices').select('*').order('created_at', { ascending: false });
    setNotices(data || []);
  };

  const handleSaveNotice = async (e) => {
    e.preventDefault();
    let fileUrl = '';

    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const { data, error: uploadError } = await supabase.storage
        .from('notice-attachments')
        .upload(fileName, file);

      if (uploadError) {
        alert('File upload failed! Verify Storage bucket structures and policies.');
        return;
      }
      
      const { data: publicUrlData } = supabase.storage.from('notice-attachments').getPublicUrl(fileName);
      fileUrl = publicUrlData.publicUrl;
    }

    if (editingId) {
      const updateData = { title, category, teacher_id: teacherId };
      if (fileUrl) updateData.file_url = fileUrl;
      await supabase.from('notices').update(updateData).eq('id', editingId);
      setEditingId(null);
    } else {
      await supabase.from('notices').insert([{ title, category, teacher_id: teacherId, file_url: fileUrl }]);
    }

    setTitle('');
    setTeacherId('');
    setFile(null);
    const fileInput = document.getElementById('file-field');
    if (fileInput) fileInput.value = '';
    fetchNotices();
  };

  const handleEdit = (notice) => {
    setEditingId(notice.id);
    setTitle(notice.title);
    setCategory(notice.category);
    setTeacherId(notice.teacher_id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this notice?')) {
      await supabase.from('notices').delete().eq('id', id);
      fetchNotices();
    }
  };

  const theme = {
    bg: darkMode ? '#1e293b' : '#ffffff',
    text: darkMode ? '#f8fafc' : '#1e293b',
    border: darkMode ? '#334155' : '#cbd5e1',
    formBg: darkMode ? '#0f172a' : '#f8fafc',
    inputBg: darkMode ? '#1e293b' : '#ffffff',
    itemBorder: darkMode ? '#334155' : '#e2e8f0'
  };

  return (
    <div style={{ ...styles.container, color: theme.text }}>
      <div style={styles.dashHeader}>
        <div>
          <h2 style={{ margin: 0, color: darkMode ? '#60a5fa' : '#1e3a8a' }}>ETE Admin Panel</h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: darkMode ? '#cbd5e1' : '#64748b' }}>Manage RUET Notices</p>
        </div>
        <button onClick={onLogout} style={styles.logoutBtn}>Sign Out</button>
      </div>

      {/* Form Area */}
      <form onSubmit={handleSaveNotice} style={{ ...styles.form, backgroundColor: theme.formBg, borderColor: theme.border }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>{editingId ? '✏️ Modify Selected Notice' : '📢 Publish New Notice'}</h3>
        
        <input 
          type="text" 
          placeholder="Notice Title" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          style={{ ...styles.input, backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }} 
          required 
        />
        <input 
          type="text" 
          placeholder="Your Teacher ID" 
          value={teacherId} 
          onChange={(e) => setTeacherId(e.target.value)} 
          style={{ ...styles.input, backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }} 
          required 
        />
        
        <select 
          value={category} 
          onChange={(e) => setCategory(e.target.value)} 
          style={{ ...styles.input, backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }}
        >
          <option value="CT Results">CT Results</option>
          <option value="Exam / Class Routines">Exam / Class Routines</option>
          <option value="Academic Calendars">Academic Calendars</option>
          <option value="Others Notices">Others Notices</option>
        </select>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '5px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600' }}>Attachment Document (Optional):</label>
          <input id="file-field" type="file" onChange={(e) => setFile(e.target.files[0])} style={{ ...styles.input, backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }} />
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '5px', flexWrap: 'wrap' }}>
          <button type="submit" style={styles.submitBtn}>{editingId ? 'Update Notice' : 'Publish Notice'}</button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setTitle(''); setTeacherId(''); }} style={styles.cancelBtn}>
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      {/* Admin Control List */}
      <h3 style={{ fontSize: '16px', marginBottom: '12px', borderBottom: `2px solid ${theme.border}`, paddingBottom: '6px' }}>Active System Notices</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {notices.map(n => (
          <div key={n.id} style={{ ...styles.item, backgroundColor: theme.bg, borderColor: theme.itemBorder }}>
            <div style={{ flex: '1', marginRight: '15px' }}>
              <span style={{ ...styles.itemBadge, backgroundColor: darkMode ? '#3b82f633' : '#e0f2fe', color: darkMode ? '#60a5fa' : '#0369a1' }}>{n.category}</span>
              <div style={{ fontWeight: '500', marginTop: '6px', fontSize: '14px', lineHeight: '1.4' }}>{n.title}</div>
              <div style={{ fontSize: '11px', color: darkMode ? '#cbd5e1' : '#64748b', marginTop: '4px' }}>By: {n.teacher_id} | {new Date(n.created_at).toLocaleDateString()}</div>
            </div>
            <div style={styles.actionBlock}>
              <button onClick={() => handleEdit(n)} style={styles.editBtn}>Edit</button>
              <button onClick={() => handleDelete(n.id)} style={styles.delBtn}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '780px', margin: '0 auto', padding: '15px', fontFamily: 'system-ui, sans-serif' },
  dashHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' },
  logoutBtn: { backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', fontSize: '13px' },
  form: { padding: '20px', borderRadius: '10px', border: '1px solid', marginBottom: '30px', display: 'flex', flexDirection: 'column', gap: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  input: { padding: '10px', borderRadius: '6px', border: '1px solid', fontSize: '14px', outline: 'none' },
  submitBtn: { padding: '10px 20px', backgroundColor: '#16a34a', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '6px', fontWeight: '600', fontSize: '14px', flex: '1 1 auto' },
  cancelBtn: { padding: '10px 20px', backgroundColor: '#94a3b8', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '6px', fontSize: '14px' },
  
  // Mobile-ready listing adjustments 
  item: { display: 'flex', justifyContent: 'space-between', padding: '14px', borderRadius: '8px', border: '1px solid', alignItems: 'center', flexWrap: 'wrap', gap: '12px' },
  itemBadge: { padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' },
  actionBlock: { display: 'flex', gap: '8px' },
  editBtn: { padding: '6px 12px', backgroundColor: '#eab308', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' },
  delBtn: { padding: '6px 12px', backgroundColor: '#ef4444', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }
};