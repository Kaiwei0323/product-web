'use server';

import fs from 'fs';
import path from 'path';

async function listPdfsByCategory(baseDir: string, categoryDir: string) {
	const fullPath = path.join(baseDir, categoryDir);
	try {
		const entries = await fs.promises.readdir(fullPath, { withFileTypes: true });
		return entries
			.filter(e => e.isFile() && e.name.toLowerCase().endsWith('.pdf'))
			.map(e => ({
				name: e.name,
				url: `/download/resource/case_study/${categoryDir}/${encodeURIComponent(e.name)}`
			}));
	} catch {
		return [] as { name: string; url: string }[];
	}
}

export default async function ResourcePage() {
	const baseDir = path.join(process.cwd(), 'public', 'download', 'resource', 'case_study');
	const categories = [
		{ key: 'smart_factory', label: 'Smart Factory' },
		{ key: 'smart_railway', label: 'Smart Railway' },
		{ key: 'smart_traffic', label: 'Smart Traffic' },
	];

	const data = await Promise.all(
		categories.map(async c => ({
			...c,
			files: await listPdfsByCategory(baseDir, c.key)
		}))
	);

	const hasAny = data.some(c => c.files.length > 0);

	return (
		<div className="bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 min-h-screen">
			<div className="max-w-5xl w-full mx-auto space-y-8">
				<div>
					<h1 className="text-4xl font-bold mb-3">Resource Library</h1>
				</div>
				{!hasAny && (
					<div className="rounded-md bg-yellow-50 p-4">
						<p className="text-sm text-yellow-800">No resources found. Please add PDFs under <code>public/download/resource/case_study</code>.</p>
					</div>
				)}
				<div>
					<h2 className="text-2xl font-semibold">Case Study</h2>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{data.map(cat => (
						<div key={cat.key} className="bg-white border rounded-lg p-4 shadow-sm">
							<h2 className="text-xl font-semibold mb-3">{cat.label}</h2>
							{cat.files.length === 0 ? (
								<p className="text-sm text-gray-500">No files available.</p>
							) : (
								<ul className="space-y-2">
									{cat.files.map(file => (
										<li key={file.name} className="flex items-center justify-between">
											<span className="text-sm text-gray-700 truncate pr-2" title={file.name}>{file.name}</span>
											<a href={file.url} download className="text-primary hover:text-red-500 text-sm" rel="noopener noreferrer">
												Download
											</a>
										</li>
									))}
								</ul>
							)}
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
