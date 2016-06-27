if (typeof(Breakpoints) !== 'undefined') {
    var size = 'small';

    if (Breakpoints.isMatched({name: 'LARGE_UP_BREAKPOINT'})) size = 'large';
    document.cookie = "u_t=" + size + "; expires=0; path=/; domain=istockphoto.com";
}
