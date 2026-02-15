import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RefreshCw, Music, ChevronsDown } from 'lucide-react';
import { driveService } from '../services/driveService';
import { FileCard } from '../components/browser/FileCard';
import { SearchBar } from '../components/browser/SearchBar';
import { Loading } from '../components/common/Loading';
import { useUIStore } from '../store';
import type { DriveFile } from '@ruaj-latino/shared';

export const Browse = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [files, setFiles] = useState<DriveFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const { addToast } = useUIStore();

  // Use a ref for nextPageToken so loadFiles doesn't need it as a dependency
  const nextPageTokenRef = useRef(nextPageToken);
  nextPageTokenRef.current = nextPageToken;

  const loadFiles = useCallback(async (search?: string, append = false) => {
    try {
      setIsLoading(!append);
      const response = await driveService.getFiles({
        search: search || undefined,
        pageToken: append ? nextPageTokenRef.current : undefined,
      });

      if (append) {
        setFiles((prev) => [...prev, ...response.files]);
      } else {
        setFiles(response.files);
      }
      setNextPageToken(response.nextPageToken);
    } catch (error) {
      addToast((error as Error).message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadFiles(searchQuery);
  }, [searchQuery, loadFiles]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setNextPageToken(undefined);
  }, []);

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      const result = await driveService.syncFiles();
      addToast(`Synced ${result.synced} files from Drive`, 'success');
      loadFiles(searchQuery);
    } catch (error) {
      addToast((error as Error).message, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLoadMore = () => {
    if (nextPageToken) {
      loadFiles(searchQuery, true);
    }
  };

  const handleLoadAll = async () => {
    if (!nextPageToken || isLoadingAll) return;

    setIsLoadingAll(true);
    try {
      let token: string | undefined = nextPageTokenRef.current;
      while (token) {
        const response = await driveService.getFiles({
          search: searchQuery || undefined,
          pageToken: token,
        });
        setFiles((prev) => [...prev, ...response.files]);
        token = response.nextPageToken;
        nextPageTokenRef.current = token;
        setNextPageToken(token);
      }
    } catch (error) {
      addToast((error as Error).message, 'error');
    } finally {
      setIsLoadingAll(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Browse Music</h1>
          <p className="text-gray-400 text-sm mt-1">
            {files.length} songs available
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-64">
            <SearchBar onSearch={handleSearch} />
          </div>
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="btn-secondary"
            title="Sync with Google Drive"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync</span>
          </button>
        </div>
      </div>

      {/* Files grid */}
      {isLoading ? (
        <Loading text="Loading songs..." />
      ) : files.length > 0 ? (
        <>
          <div className="grid gap-2">
            {files.map((file) => (
              <FileCard key={file.id} file={file} />
            ))}
          </div>

          {/* Pagination */}
          {nextPageToken && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                onClick={handleLoadMore}
                className="btn-secondary"
                disabled={isLoadingAll}
              >
                Load more
              </button>
              <button
                onClick={handleLoadAll}
                className="btn-secondary"
                disabled={isLoadingAll}
              >
                {isLoadingAll ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Loading all...
                  </>
                ) : (
                  <>
                    <ChevronsDown className="w-4 h-4" />
                    Load all
                  </>
                )}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="card text-center py-12">
          <Music className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">
            {searchQuery ? 'No songs found' : 'No songs available'}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {searchQuery
              ? 'Try a different search term'
              : 'Make sure your Google Drive folder is properly configured'}
          </p>
        </div>
      )}
    </div>
  );
};
