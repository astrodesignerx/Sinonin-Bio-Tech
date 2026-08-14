# Content

Client-supplied brand assets: logo files, the button mark, the quotation PDF.
These are small and stable, so they stay in the repo.

## Where the video masters went

The raw video this site's clips were cut from is **not** in the repo. It lives
alongside it, outside version control:

    ../Sinonin Bio Tech Masters/video/

Five files, about 70 MB. They are sources, not deliverables: nothing in the
site loads them, and every one of them was already re-encoded down to a web
file in `public/videos/` at roughly a fiftieth of the size.

They sit outside the repo because git keeps every version of every binary it
has ever seen forever. A 40 MB master committed once is 40 MB in every clone of
this project from then on, including the ones that never touch video.

`.gitignore` carries `/Content/*.mp4`, so dropping a new master in this folder
will not silently put it back into the history. Keep new masters in the folder
above instead.
