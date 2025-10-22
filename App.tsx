import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import InputGroup from './components/InputGroup';
import LoadingSpinner from './components/LoadingSpinner';
import PromptCard from './components/PromptCard';
import { generateStoryPrompts, generateImage } from './services/geminiService';
import type { StoryPanel } from './types';

const comicStyles = [
    { value: 'cartoon', label: 'Truyện tranh trẻ em' },
    { value: 'pixar', label: 'Hoạt hình Pixar 3D' },
    { value: 'anime', label: 'Anime / Manga Nhật Bản' },
    { value: 'watercolor', label: 'Màu nước nghệ thuật' }
];

const gradeLevels = Array.from({ length: 12 }, (_, i) => ({
    value: `${i + 1}`,
    label: `Lớp ${i + 1}`
}));

const colorOptions = [
    { value: 'color', label: 'Ảnh màu' },
    { value: 'bw', label: 'Ảnh đen trắng' }
];


const App: React.FC = () => {
    const [topic, setTopic] = useState('Toán học');
    const [content, setContent] = useState('Phép cộng đơn giản trong phạm vi 10');
    const [characters, setCharacters] = useState('Một chú thỏ tên là Tí và một cô sóc tên là Nâu.');
    const [numPrompts, setNumPrompts] = useState<number>(4);
    const [numQuestions, setNumQuestions] = useState<number>(2);
    const [comicStyle, setComicStyle] = useState('cartoon');
    const [gradeLevel, setGradeLevel] = useState('1');
    const [colorOption, setColorOption] = useState('color');

    const [storyPanels, setStoryPanels] = useState<StoryPanel[]>([]);
    const [questions, setQuestions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [allCopied, setAllCopied] = useState(false);
    const [isAutoGeneratingImages, setIsAutoGeneratingImages] = useState(false);
    const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 0 });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setStoryPanels([]);
        setQuestions([]);
        setIsAutoGeneratingImages(false);

        try {
            const result = await generateStoryPrompts(topic, content, characters, numPrompts, numQuestions, comicStyle, gradeLevel, colorOption);
            setStoryPanels(result.panels);
            setQuestions(result.questions);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Đã xảy ra lỗi không xác định.');
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGenerateAllImages = async () => {
        setIsAutoGeneratingImages(true);
        const totalImages = storyPanels.filter(p => !p.imageUrl).length;
        setGenerationProgress({ current: 0, total: totalImages });

        let generatedCount = 0;
    
        for (const panel of storyPanels) {
            // Bỏ qua nếu ảnh đã tồn tại
            if (panel.imageUrl) {
                continue;
            }
    
            // Đánh dấu panel hiện tại đang được tạo ảnh
            setStoryPanels(currentPanels =>
                currentPanels.map(p =>
                    p.panel === panel.panel ? { ...p, isGeneratingImage: true } : p
                )
            );
    
            try {
                const imageUrl = await generateImage(panel.imagePrompt);
                // Cập nhật panel với ảnh mới và đánh dấu hoàn thành
                setStoryPanels(currentPanels =>
                    currentPanels.map(p =>
                        p.panel === panel.panel
                            ? { ...p, imageUrl, isGeneratingImage: false }
                            : p
                    )
                );
                generatedCount++;
                setGenerationProgress({ current: generatedCount, total: totalImages });
            } catch (err) {
                console.error(`Không thể tạo ảnh cho cảnh ${panel.panel}:`, err);
                 // Dừng tạo ảnh cho panel này dù có lỗi
                setStoryPanels(currentPanels =>
                    currentPanels.map(p =>
                        p.panel === panel.panel ? { ...p, isGeneratingImage: false } : p
                    )
                );
                 // Có thể hiển thị thông báo lỗi cho người dùng ở đây nếu cần
            }
        }
    
        setIsAutoGeneratingImages(false);
    };


    const handleExportAll = () => {
        const allPrompts = storyPanels.map(p => `Panel ${p.panel}:\n${p.imagePrompt}`).join('\n\n---\n\n');
        navigator.clipboard.writeText(allPrompts);
        setAllCopied(true);
        setTimeout(() => setAllCopied(false), 2000);
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md border border-slate-200">
                        <h2 className="text-xl font-semibold text-slate-800 mb-4">Nhập thông tin câu chuyện</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <InputGroup label="Chủ đề bài học" id="topic" type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Ví dụ: Khoa học, Lịch sử, Toán học..." required />
                            <InputGroup label="Nội dung chi tiết" id="content" type="textarea" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Ví dụ: Vòng tuần hoàn của nước, Phép cộng..." required />
                            <InputGroup label="Mô tả nhân vật" id="characters" type="textarea" value={characters} onChange={(e) => setCharacters(e.target.value)} placeholder="Ví dụ: An là một cậu bé tò mò, thích khám phá..." required />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InputGroup label="Lớp học" id="gradeLevel" type="select" value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)} options={gradeLevels} />
                                <InputGroup label="Phong cách truyện tranh" id="comicStyle" type="select" value={comicStyle} onChange={(e) => setComicStyle(e.target.value)} options={comicStyles} />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <InputGroup label="Số lượng cảnh" id="numPrompts" type="number" value={numPrompts} onChange={(e) => setNumPrompts(parseInt(e.target.value, 10))} placeholder="4" required min={1} />
                                <InputGroup label="Số lượng câu hỏi" id="numQuestions" type="number" value={numQuestions} onChange={(e) => setNumQuestions(parseInt(e.target.value, 10))} placeholder="2" required min={0} />
                                <InputGroup label="Màu sắc" id="colorOption" type="select" value={colorOption} onChange={(e) => setColorOption(e.target.value)} options={colorOptions} />
                            </div>
                            <button type="submit" disabled={isLoading || isAutoGeneratingImages} className="w-full bg-teal-600 text-white font-bold py-2 px-4 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-slate-400 disabled:cursor-not-allowed">
                                {isLoading ? 'Đang tạo...' : 'Tạo Kịch Bản Truyện'}
                            </button>
                        </form>
                    </div>

                    <div className="mt-10">
                        {isLoading && <LoadingSpinner />}
                        {error && <div className="text-center p-4 bg-red-100 text-red-700 rounded-md">{error}</div>}
                        
                        {(storyPanels.length > 0) && (
                            <div className="space-y-10">
                                <div className="text-center p-6 bg-white rounded-lg shadow-md border border-slate-200">
                                     <h2 className="text-2xl font-bold text-slate-800">Câu chuyện của bạn đã sẵn sàng!</h2>
                                     <p className="text-slate-500 mt-2">Bây giờ bạn có thể tạo hình ảnh cho toàn bộ câu chuyện hoặc sao chép các câu lệnh.</p>
                                     <div className="mt-4 flex flex-col sm:flex-row justify-center gap-3">
                                        <button
                                            onClick={handleGenerateAllImages}
                                            disabled={isAutoGeneratingImages}
                                            className="px-6 py-3 text-base font-bold rounded-md transition-colors bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-wait"
                                        >
                                            {isAutoGeneratingImages ? `Đang tạo ảnh (${generationProgress.current}/${generationProgress.total})...` : '🎨 Tạo Toàn Bộ Ảnh'}
                                        </button>
                                        <button
                                            onClick={handleExportAll}
                                            disabled={isAutoGeneratingImages}
                                            className={`px-6 py-3 text-base font-medium rounded-md transition-colors ${
                                                allCopied 
                                                ? 'bg-green-500 text-white' 
                                                : 'bg-indigo-500 text-white hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                                            } disabled:bg-slate-400 disabled:cursor-not-allowed`}
                                        >
                                            {allCopied ? 'Đã sao chép!' : 'Sao chép tất cả Prompt'}
                                        </button>
                                     </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {storyPanels.map((panel) => (
                                        <PromptCard 
                                            key={panel.panel} 
                                            panel={panel} 
                                        />
                                    ))}
                                </div>

                                {questions.length > 0 && (
                                    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
                                        <h3 className="text-xl font-semibold text-slate-800 mb-4">Câu hỏi ôn tập</h3>
                                        <ol className="list-decimal list-inside space-y-2 text-slate-700">
                                            {questions.map((q, index) => (
                                                <li key={index}>{q}</li>
                                            ))}
                                        </ol>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default App;