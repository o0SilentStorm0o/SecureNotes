/**
 * @file firebase-mocks.spec.ts
 * @brief Provides mock implementations for Firebase Database functions for testing purposes.
 *
 * This file exports a function to create a dummy Database mock that simulates the behavior of
 * Firebase Database references. It is used in testing to stub out real Firebase calls.
 *
 * Usage:
 * @code
 *   const dbMock = createDatabaseMock();
 *   // Use dbMock as the Database provider in TestBed
 * @endcode
 */

export const createDatabaseMock = () => {
  const createRef = (path: string) => {
    const ref: any = {
      key: 'dummyNotesKey',
      _path: path,
      parent: null,
      root: null,
      child: function(childPath: string) {
        return createRef(this._path + '/' + childPath);
      },
      push: () => ({ key: 'dummyNoteKey' }),
      set: () => Promise.resolve(),
      get: () => Promise.resolve({
        exists: () => false,
        val: () => ({})
      }),
      remove: () => Promise.resolve(),
      toString: function() { return this._path; }
    };
    ref.parent = ref;
    ref.root = ref;
    return ref;
  };

  const db = {
    _checkNotDeleted: () => true,
    ref: (path?: string) => createRef(path || '/dummyNotes')
  };

  return db;
};
