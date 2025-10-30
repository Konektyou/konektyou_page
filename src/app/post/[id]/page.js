'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navigation from '../../../components/Navigation';
import Footer from '../../../components/Footer';

export default function PostPage() {
  const params = useParams();
  const postId = params.id;
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock post data - in a real app, this would come from an API
  const mockPost = {
    id: postId,
    title: "How to Find Reliable Service Providers in Your Area",
    author: "Sarah Johnson",
    date: "October 23, 2024",
    readTime: "5 min read",
    category: "Business Tips",
    content: `
      <p>Finding reliable service providers can be challenging, especially when you need help quickly. Whether you're looking for personal support workers, office assistance, or other professional services, here are some key strategies to ensure you find the right match.</p>
      
      <h2>1. Define Your Needs Clearly</h2>
      <p>Before starting your search, make a clear list of what you need. Consider the specific skills required, the duration of service, and any special requirements. This clarity will help you communicate effectively with potential providers.</p>
      
      <h2>2. Check Credentials and Reviews</h2>
      <p>Always verify credentials and read reviews from previous clients. Look for providers with consistent positive feedback and relevant experience in your specific area of need.</p>
      
      <h2>3. Use Trusted Platforms</h2>
      <p>Platforms like Konektly provide verified professionals with background checks and insurance. This gives you peace of mind and protection when hiring service providers.</p>
      
      <h2>4. Conduct Initial Interviews</h2>
      <p>Even for short-term services, a brief conversation can help you assess compatibility and professionalism. Ask about their experience, availability, and approach to the work.</p>
      
      <h2>5. Set Clear Expectations</h2>
      <p>Communicate your expectations clearly from the start. Discuss timelines, deliverables, and any specific requirements to avoid misunderstandings later.</p>
      
      <p>By following these steps, you can find reliable service providers who will meet your needs and exceed your expectations.</p>
    `,
    tags: ["Service Providers", "Business", "Tips", "Professional Services"],
    image: "/logo.png"
  };

  useEffect(() => {
    // Simulate API call
    const fetchPost = async () => {
      setLoading(true);
      // In a real app, you would fetch from an API
      // const response = await fetch(`/api/posts/${postId}`);
      // const data = await response.json();
      
      // For now, use mock data
      setTimeout(() => {
        setPost(mockPost);
        setLoading(false);
      }, 1000);
    };

    fetchPost();
  }, [postId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading post...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
            <p className="text-gray-600 mb-6">The post you're looking for doesn't exist.</p>
            <a 
              href="/" 
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Home
            </a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-block bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium mb-4">
              {post.category}
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              {post.title}
            </h1>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-blue-100">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-lg font-semibold">{post.author.charAt(0)}</span>
                </div>
                <span className="font-medium">{post.author}</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span>{post.date}</span>
                <span>•</span>
                <span>{post.readTime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg max-w-none">
          <div 
            className="text-gray-800 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>

        {/* Tags */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag, index) => (
              <span 
                key={index}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Author Bio */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {post.author.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{post.author}</h3>
              <p className="text-gray-600 mt-1">
                Business consultant and service industry expert with over 10 years of experience helping companies find the right talent.
              </p>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Related Articles</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Building Your Service Provider Network</h4>
              <p className="text-gray-600 text-sm mb-3">Learn how to build and maintain relationships with reliable service providers.</p>
              <a href="#" className="text-blue-600 text-sm font-medium hover:text-blue-700">Read more →</a>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Best Practices for Service Provider Management</h4>
              <p className="text-gray-600 text-sm mb-3">Essential tips for managing and coordinating with your service providers effectively.</p>
              <a href="#" className="text-blue-600 text-sm font-medium hover:text-blue-700">Read more →</a>
            </div>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
}
