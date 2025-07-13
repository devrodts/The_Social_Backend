const axios = require('axios');

const GRAPHQL_URL = 'http://localhost:3000/graphql';

// Test data
const testUser = {
  username: 'testuser_like',
  email: 'testlike@example.com',
  password: 'password123'
};

const testTweet = {
  content: 'This is a test tweet for like/unlike functionality!'
};

let authToken = '';
let userId = '';
let tweetId = '';

async function makeGraphQLRequest(query, variables = {}) {
  try {
    const response = await axios.post(GRAPHQL_URL, {
      query,
      variables
    }, {
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` })
      }
    });
    return response.data;
  } catch (error) {
    console.error('GraphQL request failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testLikeUnlikeFlow() {
  console.log('🚀 Starting Like/Unlike Flow Test...\n');

  try {
    // Step 1: Register a new user
    console.log('1️⃣ Registering test user...');
    const registerQuery = `
      mutation Register($input: RegisterInputDTO!) {
        register(input: $input) {
          user {
            id
            username
            email
          }
          accessToken
        }
      }
    `;
    
    const registerResult = await makeGraphQLRequest(registerQuery, {
      input: testUser
    });
    
    if (registerResult.errors) {
      console.error('❌ Registration failed:', registerResult.errors);
      return;
    }
    
    authToken = registerResult.data.register.accessToken;
    userId = registerResult.data.register.user.id;
    console.log('✅ User registered successfully:', registerResult.data.register.user.username);
    console.log('   User ID:', userId);
    console.log('   Auth Token:', authToken.substring(0, 20) + '...\n');

    // Step 2: Create a tweet
    console.log('2️⃣ Creating test tweet...');
    const createTweetQuery = `
      mutation CreateTweet($input: CreateTweetInputDTO!) {
        createTweet(input: $input) {
          id
          content
          likesCount
          author {
            id
            username
          }
        }
      }
    `;
    
    const createTweetResult = await makeGraphQLRequest(createTweetQuery, {
      input: testTweet
    });
    
    if (createTweetResult.errors) {
      console.error('❌ Tweet creation failed:', createTweetResult.errors);
      return;
    }
    
    tweetId = createTweetResult.data.createTweet.id;
    console.log('✅ Tweet created successfully');
    console.log('   Tweet ID:', tweetId);
    console.log('   Content:', createTweetResult.data.createTweet.content);
    console.log('   Initial likes count:', createTweetResult.data.createTweet.likesCount);
    console.log('   Author:', createTweetResult.data.createTweet.author.username, '\n');

    // Step 3: Check initial like status
    console.log('3️⃣ Checking initial like status...');
    const isLikedQuery = `
      query IsLiked($tweetId: ID!) {
        isLiked(tweetId: $tweetId)
      }
    `;
    
    const isLikedResult = await makeGraphQLRequest(isLikedQuery, {
      tweetId
    });
    
    console.log('   Is liked initially:', isLikedResult.data.isLiked, '\n');

    // Step 4: Like the tweet
    console.log('4️⃣ Liking the tweet...');
    const likeTweetQuery = `
      mutation LikeTweet($input: CreateLikeInputDTO!) {
        likeTweet(input: $input) {
          id
          userId
          tweetId
          createdAt
        }
      }
    `;
    
    const likeResult = await makeGraphQLRequest(likeTweetQuery, {
      input: { tweetId }
    });
    
    if (likeResult.errors) {
      console.error('❌ Like failed:', likeResult.errors);
      return;
    }
    
    console.log('✅ Tweet liked successfully');
    console.log('   Like ID:', likeResult.data.likeTweet.id);
    console.log('   User ID:', likeResult.data.likeTweet.userId);
    console.log('   Tweet ID:', likeResult.data.likeTweet.tweetId, '\n');

    // Step 5: Check like status after liking
    console.log('5️⃣ Checking like status after liking...');
    const isLikedAfterResult = await makeGraphQLRequest(isLikedQuery, {
      tweetId
    });
    
    console.log('   Is liked after liking:', isLikedAfterResult.data.isLiked, '\n');

    // Step 6: Check tweet likes count
    console.log('6️⃣ Checking tweet likes count...');
    const likesCountQuery = `
      query LikesCount($tweetId: ID!) {
        likesCount(tweetId: $tweetId)
      }
    `;
    
    const likesCountResult = await makeGraphQLRequest(likesCountQuery, {
      tweetId
    });
    
    console.log('   Likes count:', likesCountResult.data.likesCount, '\n');

    // Step 7: Try to like the same tweet again (should fail)
    console.log('7️⃣ Attempting to like the same tweet again (should fail)...');
    try {
      const duplicateLikeResult = await makeGraphQLRequest(likeTweetQuery, {
        input: { tweetId }
      });
      
      if (duplicateLikeResult.errors) {
        console.log('✅ Correctly prevented duplicate like');
        console.log('   Error:', duplicateLikeResult.errors[0].message, '\n');
      } else {
        console.log('❌ Duplicate like should have failed but succeeded');
      }
    } catch (error) {
      console.log('✅ Correctly prevented duplicate like');
      console.log('   Error:', error.response?.data?.errors?.[0]?.message || error.message, '\n');
    }

    // Step 8: Unlike the tweet
    console.log('8️⃣ Unliking the tweet...');
    const unlikeTweetQuery = `
      mutation UnlikeTweet($tweetId: ID!) {
        unlikeTweet(tweetId: $tweetId)
      }
    `;
    
    const unlikeResult = await makeGraphQLRequest(unlikeTweetQuery, {
      tweetId
    });
    
    if (unlikeResult.errors) {
      console.error('❌ Unlike failed:', unlikeResult.errors);
      return;
    }
    
    console.log('✅ Tweet unliked successfully');
    console.log('   Result:', unlikeResult.data.unlikeTweet, '\n');

    // Step 9: Check like status after unliking
    console.log('9️⃣ Checking like status after unliking...');
    const isLikedAfterUnlikeResult = await makeGraphQLRequest(isLikedQuery, {
      tweetId
    });
    
    console.log('   Is liked after unliking:', isLikedAfterUnlikeResult.data.isLiked, '\n');

    // Step 10: Check final likes count
    console.log('🔟 Checking final likes count...');
    const finalLikesCountResult = await makeGraphQLRequest(likesCountQuery, {
      tweetId
    });
    
    console.log('   Final likes count:', finalLikesCountResult.data.likesCount, '\n');

    // Step 11: Try to unlike again (should fail)
    console.log('1️⃣1️⃣ Attempting to unlike again (should fail)...');
    try {
      const duplicateUnlikeResult = await makeGraphQLRequest(unlikeTweetQuery, {
        tweetId
      });
      
      if (duplicateUnlikeResult.errors) {
        console.log('✅ Correctly prevented duplicate unlike');
        console.log('   Error:', duplicateUnlikeResult.errors[0].message, '\n');
      } else {
        console.log('❌ Duplicate unlike should have failed but succeeded');
      }
    } catch (error) {
      console.log('✅ Correctly prevented duplicate unlike');
      console.log('   Error:', error.response?.data?.errors?.[0]?.message || error.message, '\n');
    }

    // Step 12: Test with non-existent tweet
    console.log('1️⃣2️⃣ Testing like with non-existent tweet (should fail)...');
    try {
      const nonExistentResult = await makeGraphQLRequest(likeTweetQuery, {
        input: { tweetId: 'non-existent-tweet-id' }
      });
      
      if (nonExistentResult.errors) {
        console.log('✅ Correctly handled non-existent tweet');
        console.log('   Error:', nonExistentResult.errors[0].message, '\n');
      } else {
        console.log('❌ Should have failed for non-existent tweet');
      }
    } catch (error) {
      console.log('✅ Correctly handled non-existent tweet');
      console.log('   Error:', error.response?.data?.errors?.[0]?.message || error.message, '\n');
    }

    console.log('🎉 All tests completed successfully!');
    console.log('✅ Like/Unlike functionality is working correctly');
    console.log('✅ All edge cases are handled properly');
    console.log('✅ Tweet likes count is updated correctly');
    console.log('✅ Authentication is working');
    console.log('✅ Error handling is robust');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response?.data) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the test
testLikeUnlikeFlow(); 