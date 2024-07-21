export interface Folder {
	id: string;
	name: string;
	parentId?: string;

	folders?: Folder[];
	notes?: Note[];
}

export interface HistoricalNote {
	title: string;
	content: string;
	time: number;
}

export interface Note {
	id: string;
	title: string;
	folderId: string;

	content: string;
	history: HistoricalNote[];
	mentions?: string[];
}

export interface User {
	id: string;
	username: string;
}
