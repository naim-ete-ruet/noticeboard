// src/components/StudentView.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function StudentView({ onAdminLoginClick, darkMode, setDarkMode }) {
  const [notices, setNotices] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const itemsPerPage = 5;

  const categories = ['All', 'CT Results', 'Exam / Class Routines', 'Academic Calendars', 'Others Notices'];

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    const { data, error } = await supabase
      .from('notices')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setNotices(data);
  };

  const filteredNotices = notices.filter((notice) => {
    const matchesCategory = category === 'All' || notice.category === category;
    const matchesSearch = notice.title.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentNotices = filteredNotices.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredNotices.length / itemsPerPage);

  const theme = {
    bg: darkMode ? '#1e293b' : '#ffffff',
    navBg: darkMode ? '#0f172a' : '#ffffff',
    text: darkMode ? '#f8fafc' : '#1e293b',
    subText: darkMode ? '#cbd5e1' : '#64748b',
    border: darkMode ? '#334155' : '#e2e8f0',
    thBg: darkMode ? '#334155' : '#f1f5f9',
    inputBg: darkMode ? '#0f172a' : '#ffffff',
    cardBg: darkMode ? '#1e293b' : '#ffffff'
  };

  return (
    <div style={{ backgroundColor: darkMode ? '#0f172a' : '#f8fafc', minHeight: '100vh' }}>
      
      {/* FIXED STICKY NAVBAR */}
      <nav style={{ ...styles.navbar, backgroundColor: theme.navBg, borderColor: theme.border }}>
        <div style={{ ...styles.navBrand, color: darkMode ? '#60a5fa' : '#1e3a8a' }}>
          🎓 ETE Portal
        </div>
        <div style={styles.navLinks}>
          <button onClick={() => setDarkMode(!darkMode)} style={{ ...styles.toggleBtn, backgroundColor: theme.bg, color: theme.text, borderColor: theme.border }}>
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
          <button onClick={onAdminLoginClick} style={styles.adminBtn}>Admin Portal</button>
        </div>
      </nav>

      <div style={{ ...styles.container, color: theme.text }}>
        
        {/* LOGO + DEPARTMENT HEADER */}
        <header style={{ 
          ...styles.header, 
          borderBottomColor: darkMode ? '#3b82f6' : '#1e3a8a',
          flexDirection: isMobile ? 'column' : 'row',
          textAlign: isMobile ? 'center' : 'left',
          alignItems: 'center'
        }}>
          <img 
          src={`${import.meta.env.BASE_URL}logo.png`} // 👈 CHANGED THIS LINE
          alt="RUET Logo" 
          style={styles.logo}
          onError={(e) => { e.target.src = "https://en.wikipedia.org/wiki/Rajshahi_University_of_Engineering_%26_Technology#/media/File:RUET_logo.svg"; }}
          />
          <div>
            <h1 style={{ ...styles.title, color: darkMode ? '#60a5fa' : '#1e3a8a' }}>
              Department of Electronics & Telecommunication Engineering (ETE)
            </h1>
            <h2 style={{ ...styles.subtitle, color: theme.subText }}>
              Rajshahi University of Engineering & Technology (RUET)
            </h2>
          </div>
        </header>

        {/* Filter and Search Bar Controls */}
        <div style={{ ...styles.filterBar, flexDirection: isMobile ? 'column' : 'row' }}>
          <input 
            type="text" 
            placeholder="Search notice by keyword..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            style={{ ...styles.input, backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }}
          />
          <select 
            value={category} 
            onChange={(e) => { setCategory(e.target.value); setCurrentPage(1); }} 
            style={{ ...styles.select, backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }}
          >
            {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        {/* Notice List Container */}
        {isMobile ? (
          /* Mobile Stacked Card List */
          <div style={styles.mobileCardContainer}>
            {currentNotices.length > 0 ? (
              currentNotices.map((notice) => (
                <div key={notice.id} style={{ ...styles.mobileCard, backgroundColor: theme.cardBg, borderColor: theme.border }}>
                  <div style={styles.cardHeader}>
                    <span style={{ ...styles.cardDate, color: theme.subText }}>
                      📅 {new Date(notice.created_at).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}
                    </span>
                    <span style={styles.badge}>{notice.category}</span>
                  </div>
                  <div style={styles.cardTitle}>{notice.title}</div>
                  <div style={styles.cardActions}>
                    {notice.file_url ? (
                      <>
                        <a href={notice.file_url} target="_blank" rel="noreferrer" style={styles.viewAction}>👁️ View</a>
                        <a href={`${notice.file_url}?download=`} download style={styles.downloadAction}>📥 Download</a>
                      </>
                    ) : (
                      <span style={{ color: theme.subText, fontSize: '13px', fontStyle: 'italic' }}>No attachment available</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '30px', color: theme.subText }}>No notices found.</div>
            )}
          </div>
        ) : (
          /* Desktop Table View Window Layout Table */
          <div style={{ ...styles.tableWrapper, borderColor: theme.border, backgroundColor: theme.bg }}>
            <table style={styles.table}>
              <thead>
                <tr style={{ backgroundColor: theme.thBg }}>
                  <th style={{ ...styles.th, ...styles.colDate, color: theme.text, borderColor: theme.border }}>Date</th>
                  <th style={{ ...styles.th, ...styles.colTitle, color: theme.text, borderColor: theme.border }}>Title of Notice</th>
                  <th style={{ ...styles.th, ...styles.colAction, color: theme.text, borderColor: theme.border, textAlign: 'center' }}>Attachment</th>
                </tr>
              </thead>
              <tbody>
                {currentNotices.length > 0 ? (
                  currentNotices.map((notice) => (
                    <tr key={notice.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                      <td style={{ ...styles.td, color: theme.subText, fontSize: '13px', fontWeight: '500' }}>
                        {new Date(notice.created_at).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}
                      </td>
                      <td style={styles.td}>
                        <div style={styles.titleContainer}>
                          <span style={styles.noticeTitle}>{notice.title}</span>
                          <span style={styles.badge}>{notice.category}</span>
                        </div>
                      </td>
                      <td style={{ ...styles.td, textAlign: 'center' }}>
                        {notice.file_url ? (
                          <div style={styles.actionContainer}>
                            <a href={notice.file_url} target="_blank" rel="noreferrer" style={styles.viewAction}>👁️ View</a>
                            <a href={`${notice.file_url}?download=`} download style={styles.downloadAction}>📥 Download</a>
                          </div>
                        ) : (
                          <span style={{ color: theme.subText }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" style={{ ...styles.td, textAlign: 'center', color: theme.subText, padding: '30px' }}>No notices found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Engine */}
        {totalPages > 1 && (
          <div style={styles.pagination}>
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} style={{ ...styles.pageBtn, backgroundColor: theme.bg, color: theme.text, borderColor: theme.border }}>Previous</button>
            <span style={{ color: theme.subText, fontSize: '14px' }}>Page {currentPage} of {totalPages}</span>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} style={{ ...styles.pageBtn, backgroundColor: theme.bg, color: theme.text, borderColor: theme.border }}>Next</button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  // Navigation Bar Styles (With fixed scrolling support)
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 1000 },
  navBrand: { fontSize: '16px', fontWeight: '700', letterSpacing: '0.5px' },
  navLinks: { display: 'flex', gap: '12px', alignItems: 'center' },
  toggleBtn: { padding: '6px 12px', borderRadius: '6px', border: '1px solid', cursor: 'pointer', fontSize: '12px', fontWeight: '500', outline: 'none' },
  adminBtn: { backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '7px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', outline: 'none' },

  // Base Frame Styles
  container: { maxWidth: '1050px', margin: '0 auto', padding: '20px 15px', fontFamily: 'system-ui, -apple-system, sans-serif', boxSizing: 'border-box' },
  header: { display: 'flex', gap: '20px', borderBottom: '3px solid', paddingBottom: '20px', marginBottom: '25px' },
  logo: { width: '80px', height: 'auto', objectFit: 'contain' },
  title: { fontSize: 'calc(17px + 0.6vw)', margin: '0 0 6px 0', lineHeight: '1.3', fontWeight: '700' },
  subtitle: { fontSize: 'calc(13px + 0.15vw)', margin: 0, fontWeight: '400', letterSpacing: '0.2px' },
  
  filterBar: { display: 'flex', gap: '12px', marginBottom: '20px' },
  input: { flex: '2 1 auto', padding: '11px', border: '1px solid', borderRadius: '6px', fontSize: '14px', outline: 'none' },
  select: { flex: '1 1 auto', padding: '11px', border: '1px solid', borderRadius: '6px', fontSize: '14px', outline: 'none' },
  
  // Desktop Layout Table Specs
  tableWrapper: { width: '100%', overflowX: 'auto', border: '1px solid', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  th: { padding: '14px 16px', borderBottom: '1px solid', fontSize: '14px', fontWeight: '600' },
  td: { padding: '14px 16px', fontSize: '14px', verticalAlign: 'middle' },
  
  colDate: { width: '15%' },
  colTitle: { width: '60%' },
  colAction: { width: '25%' },
  
  titleContainer: { display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start' },
  noticeTitle: { fontWeight: '500', lineHeight: '1.4' },
  badge: { backgroundColor: '#3b82f61a', color: '#3b82f6', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', border: '1px solid #3b82f633', whiteSpace: 'nowrap' },
  
  actionContainer: { display: 'flex', gap: '8px', justifyContent: 'center' },
  viewAction: { display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px', backgroundColor: '#10b981', color: '#fff', textDecoration: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' },
  downloadAction: { display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px', backgroundColor: '#3b82f6', color: '#fff', textDecoration: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' },
  
  // Mobile Card Component Specs
  mobileCardContainer: { display: 'flex', flexDirection: 'column', gap: '12px' },
  mobileCard: { padding: '16px', borderRadius: '8px', border: '1px solid', display: 'flex', flexDirection: 'column', gap: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardDate: { fontSize: '12px', fontWeight: '500' },
  cardTitle: { fontSize: '14px', fontWeight: '500', lineHeight: '1.4' },
  cardActions: { display: 'flex', gap: '10px', marginTop: '4px' },

  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '20px' },
  pageBtn: { padding: '6px 14px', cursor: 'pointer', border: '1px solid', borderRadius: '6px', fontSize: '13px' }
};