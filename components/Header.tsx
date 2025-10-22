import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center">
                <h1 className="text-3xl font-bold tracking-tight text-teal-600">
                    Trình Tạo Truyện Tranh Học Tập
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                    Sử dụng AI để biến bài học thành những câu chuyện và hình ảnh hấp dẫn
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-4">
                    <a
                        href="https://www.canva.com/design/DAG1ti1-W7I/8yrD4br7sMZCiFTAxBxhGg/edit?utm_content=DAG1ti1-W7I&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-4 py-2 text-sm font-medium text-white bg-purple-500 rounded-md shadow-sm hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                    >
                        Mẫu Canva
                    </a>
                    <a
                        href="https://app.netlify.com/projects/ung-ho-tac-gia/overview"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-4 py-2 text-sm font-medium text-white bg-pink-500 rounded-md shadow-sm hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-colors"
                    >
                        Ủng hộ tác giả
                    </a>
                </div>
            </div>
        </header>
    );
};

export default Header;
