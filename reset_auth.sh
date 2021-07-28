git filter-branch -f --env-filter "
    GIT_AUTHOR_NAME='bramvandijk88'
    GIT_AUTHOR_EMAIL='vandijk@evolbio.mpg.de'
    GIT_COMMITTER_NAME='bramvandijk88'
    GIT_COMMITTER_EMAIL='vandijk@evolbio.mpg.de'
" HEAD
