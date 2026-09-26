import { Component } from 'react';

// Cảnh 3D lỗi (vd. máy không hỗ trợ WebGL) thì chỉ ẩn khung 3D, phần còn lại vẫn chạy
export class SceneErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    console.error('3D view crashed:', error);
  }

  render() {
    if (this.state.error) {
      return <p className="stage-loading">3D view is unavailable. The status panel still updates live.</p>;
    }
    return this.props.children;
  }
}
