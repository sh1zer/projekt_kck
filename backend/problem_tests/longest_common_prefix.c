   #include <stdio.h>
   #include <stdlib.h>
   #include <stdbool.h>
   #include <string.h>

   // --- USER CODE START ---
   {user_code}
   // --- USER CODE END ---

   typedef struct {
       char** strs;
       int strsSize;
       char* expected;
   } TestCase;

   int main() {
       TestCase tests[] = {
           {
               .strs = (char*[]){"flower", "flow", "flight"},
               .strsSize = 3,
               .expected = "fl"
           },
           // Add other test cases here
       };

       int num_tests = sizeof(tests) / sizeof(tests[0]);
       int all_passed = 1;

       for (int i = 0; i < num_tests; i++) {
           char* result = longestCommonPrefix(tests[i].strs, tests[i].strsSize);
           
           if (result == NULL) {
               printf("TEST_%d_STATUS=FAIL\n", i + 1);
               printf("TEST_%d_MESSAGE=Returned NULL\n", i + 1);
               all_passed = 0;
               continue;
           }

           bool test_passed = strcmp(result, tests[i].expected) == 0;

           if (test_passed) {
               printf("TEST_%d_STATUS=PASS\n", i + 1);
               printf("TEST_%d_MESSAGE=\n", i + 1);
           } else {
               printf("TEST_%d_STATUS=FAIL\n", i + 1);
               printf("TEST_%d_MESSAGE=Expected '%s', Got '%s'\n", 
                      i + 1, 
                      tests[i].expected,
                      result);
               all_passed = 0;
           }

           free(result);
       }

       return all_passed ? 0 : 1;
   }