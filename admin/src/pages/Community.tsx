import { useState, useEffect, useCallback } from 'react';
import { useAdmin } from '../hooks/useAdmin';
import { getPosts, pinPost, deletePost, getComments, deleteComment } from '../lib/adminApi';
import Modal from '../components/ui/Modal';
import type { CommunityPost, Comment } from '../types/admin';

export default function Community() {
  const { token } = useAdmin();
  const [activeTab, setActiveTab] = useState<'posts' | 'comments'>('posts');

  // Posts state
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [postTotal, setPostTotal] = useState(0);
  const [postPage, setPostPage] = useState(1);
  const [postsLoading, setPostsLoading] = useState(true);

  // Comments state
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentTotal, setCommentTotal] = useState(0);
  const [commentPage, setCommentPage] = useState(1);
  const [commentsLoading, setCommentsLoading] = useState(true);

  // Confirm delete state
  const [confirmPost, setConfirmPost] = useState<CommunityPost | null>(null);
  const [confirmComment, setConfirmComment] = useState<Comment | null>(null);

  const limit = 20;

  const loadPosts = useCallback(() => {
    if (!token) return;
    setPostsLoading(true);
    getPosts(token, { page: postPage })
      .then((res) => { setPosts(res.data); setPostTotal(res.total); })
      .catch(console.error)
      .finally(() => setPostsLoading(false));
  }, [token, postPage]);

  const loadComments = useCallback(() => {
    if (!token) return;
    setCommentsLoading(true);
    getComments(token, commentPage)
      .then((res) => { setComments(res.data); setCommentTotal(res.total); })
      .catch(console.error)
      .finally(() => setCommentsLoading(false));
  }, [token, commentPage]);

  useEffect(() => { loadPosts(); }, [loadPosts]);
  useEffect(() => { loadComments(); }, [loadComments]);

  const handlePin = async (post: CommunityPost) => {
    await pinPost(token!, post.id, !post.is_pinned);
    loadPosts();
  };

  const handleDeletePost = async () => {
    await deletePost(token!, confirmPost!.id);
    setConfirmPost(null);
    loadPosts();
  };

  const handleDeleteComment = async () => {
    await deleteComment(token!, confirmComment!.id);
    setConfirmComment(null);
    loadComments();
  };

  const postTotalPages = Math.ceil(postTotal / limit);
  const commentTotalPages = Math.ceil(commentTotal / limit);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Community</h1>
          <p className="page-subtitle">Moderate posts and comments</p>
        </div>
      </div>

      <div className="page-content">
        <div className="tabs">
          <button className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`} onClick={() => setActiveTab('posts')}>
            Posts ({postTotal})
          </button>
          <button className={`tab-btn ${activeTab === 'comments' ? 'active' : ''}`} onClick={() => setActiveTab('comments')}>
            Comments ({commentTotal})
          </button>
        </div>

        {activeTab === 'posts' && (
          <div className="data-table-wrap">
            {postsLoading ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>Loading...</div>
            ) : posts.length === 0 ? (
              <div className="empty-state">
                <p>No posts found</p>
              </div>
            ) : (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Author</th>
                      <th>Type</th>
                      <th>Upvotes</th>
                      <th>Views</th>
                      <th>Status</th>
                      <th style={{ width: 130 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((p) => (
                      <tr key={p.id}>
                        <td><span className="cell-truncate" style={{ maxWidth: 220 }} title={p.title}>{p.title}</span></td>
                        <td style={{ color: 'var(--text-secondary)' }}>{p.author_name}</td>
                        <td><span className="badge badge-accent">{p.type}</span></td>
                        <td style={{ color: 'var(--text-secondary)' }}>{p.upvotes}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{p.views}</td>
                        <td>
                          {p.is_pinned
                            ? <span className="badge badge-success">Pinned</span>
                            : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>}
                        </td>
                        <td>
                          <div className="table-actions">
                            <button
                              className={`btn btn-ghost btn-sm`}
                              onClick={() => handlePin(p)}
                              title={p.is_pinned ? 'Unpin' : 'Pin'}
                            >
                              {p.is_pinned ? 'Unpin' : 'Pin'}
                            </button>
                            <button className="btn-icon" title="Delete" onClick={() => setConfirmPost(p)} style={{ color: 'var(--danger)' }}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {postTotalPages > 1 && (
                  <div className="pagination">
                    <span className="pagination-info">{(postPage - 1) * limit + 1}–{Math.min(postPage * limit, postTotal)} of {postTotal}</span>
                    <div className="pagination-controls">
                      <button className="btn btn-ghost btn-sm" disabled={postPage === 1} onClick={() => setPostPage(postPage - 1)}>← Prev</button>
                      <button className="btn btn-ghost btn-sm" disabled={postPage >= postTotalPages} onClick={() => setPostPage(postPage + 1)}>Next →</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="data-table-wrap">
            {commentsLoading ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>Loading...</div>
            ) : comments.length === 0 ? (
              <div className="empty-state">
                <p>No comments found</p>
              </div>
            ) : (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Comment</th>
                      <th>Author</th>
                      <th>Post</th>
                      <th>Upvotes</th>
                      <th>Date</th>
                      <th style={{ width: 80 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comments.map((c) => (
                      <tr key={c.id}>
                        <td><span className="cell-truncate" style={{ maxWidth: 260 }} title={c.body}>{c.body}</span></td>
                        <td style={{ color: 'var(--text-secondary)' }}>{c.author_name}</td>
                        <td><span className="cell-truncate" style={{ maxWidth: 120, color: 'var(--text-secondary)' }} title={c.post?.title}>{c.post?.title || '—'}</span></td>
                        <td style={{ color: 'var(--text-secondary)' }}>{c.upvotes}</td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                          {new Date(c.created_at).toLocaleDateString()}
                        </td>
                        <td>
                          <button className="btn-icon" title="Delete" onClick={() => setConfirmComment(c)} style={{ color: 'var(--danger)' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {commentTotalPages > 1 && (
                  <div className="pagination">
                    <span className="pagination-info">{(commentPage - 1) * limit + 1}–{Math.min(commentPage * limit, commentTotal)} of {commentTotal}</span>
                    <div className="pagination-controls">
                      <button className="btn btn-ghost btn-sm" disabled={commentPage === 1} onClick={() => setCommentPage(commentPage - 1)}>← Prev</button>
                      <button className="btn btn-ghost btn-sm" disabled={commentPage >= commentTotalPages} onClick={() => setCommentPage(commentPage + 1)}>Next →</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {confirmPost && (
        <Modal title="Delete Post" onClose={() => setConfirmPost(null)} size="sm"
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setConfirmPost(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDeletePost}>Delete</button>
            </>
          }
        >
          <p>Are you sure you want to delete this post?</p>
          <p style={{ marginTop: 8, color: 'var(--text-secondary)', fontSize: 13 }}>{confirmPost.title}</p>
        </Modal>
      )}

      {confirmComment && (
        <Modal title="Delete Comment" onClose={() => setConfirmComment(null)} size="sm"
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setConfirmComment(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDeleteComment}>Delete</button>
            </>
          }
        >
          <p>Are you sure you want to delete this comment?</p>
          <p style={{ marginTop: 8, color: 'var(--text-secondary)', fontSize: 13 }}>{confirmComment.body}</p>
        </Modal>
      )}
    </>
  );
}
