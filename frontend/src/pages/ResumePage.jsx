import Sidebar from '../components/shared/Sidebar'

export default function ResumePage() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-amber-100 mx-auto mb-3 flex items-center justify-center">
            <div className="w-5 h-5 rounded bg-amber-400"></div>
          </div>
          <h2 className="text-slate-700 font-medium">Resume Analyzer</h2>
          <p className="text-sm text-slate-400 mt-1">Coming soon — Person 3 is building this!</p>
        </div>
      </main>
    </div>
  )
}