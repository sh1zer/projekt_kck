char* longestCommonPrefix(char** strs, int strsSize) {
    if (strsSize == 0) return "";
    if (strsSize == 1) return strdup(strs[0]);
    
    // Find the length of the shortest string
    int min_len = strlen(strs[0]);
    for (int i = 1; i < strsSize; i++) {
        int len = strlen(strs[i]);
        if (len < min_len) min_len = len;
    }
    
    // Find the longest common prefix
    int i = 0;
    while (i < min_len) {
        char current = strs[0][i];
        for (int j = 1; j < strsSize; j++) {
            if (strs[j][i] != current) {
                // Found a mismatch, return the prefix up to this point
                char* result = (char*)malloc(i + 1);
                if (result == NULL) return NULL;
                strncpy(result, strs[0], i);
                result[i] = '\0';
                return result;
            }
        }
        i++;
    }
    
    // All strings match up to min_len
    char* result = (char*)malloc(min_len + 1);
    if (result == NULL) return NULL;
    strncpy(result, strs[0], min_len);
    result[min_len] = '\0';
    return result;
}