import React, { useState, useEffect } from 'react';
import { Table, Input, Card, Statistic, message, Tabs } from 'antd';
import { StarOutlined } from '@ant-design/icons';
import api from "../../config/axios";

const { TabPane } = Tabs;

const AdminReviewManagement = () => {
    const [reviews, setReviews] = useState([]);
    const [groupedReviews, setGroupedReviews] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0 });
    const [loading, setLoading] = useState(false);
  
    useEffect(() => {
      fetchReviews();
      fetchStats();
    }, []);

    useEffect(() => {
  console.log('Stats updated:', stats);
}, [stats]);

    useEffect(() => {
      if (reviews.length > 0) {
        const grouped = reviews.reduce((acc, review) => {
          const sellerId = review.sellerId;
          if (!acc[sellerId]) {
            acc[sellerId] = {
              sellerName: review.sellerName,
              reviews: []
            };
          }
          acc[sellerId].reviews.push(review);
          return acc;
        }, {});
        setGroupedReviews(grouped);
      }
    }, [reviews]);

    const fetchReviews = async () => {
      setLoading(true);
      try {
        const response = await api.get('Reviews');
        if (response.data && Array.isArray(response.data)) {
          const reviewsWithKeys = response.data.map((review) => ({
            ...review,
            key: review.reviewId.toString(),
          }));
          setReviews(reviewsWithKeys);
        } else {
          message.error('Received unexpected data format from server.');
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
        message.error(`Failed to fetch reviews: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
      
    const fetchStats = async () => {
        try {
          const response = await api.get('Reviews/stats');
          console.log('Raw stats response:', response.data);
          if (response.data && typeof response.data === 'object') {
            const newStats = {
              averageRating: response.data.averageRating || 0,
              totalReviews: response.data.totalReviews || 0
            };
            console.log('Processed stats:', newStats);
            setStats(newStats);
          } else {
            console.error('Unexpected stats format:', response.data);
            message.error('Received unexpected stats format from server.');
          }
        } catch (error) {
          console.error('Error fetching stats:', error);
          message.error(`Failed to fetch review statistics: ${error.message}`);
        }
      };
  const columns = [
    {
      title: 'Review ID',
      dataIndex: 'reviewId',
      key: 'reviewId',
    },
    {
      title: 'User',
      dataIndex: 'userName',
      key: 'userName',
    },
    {
      title: 'Flower',
      dataIndex: 'flowerName',
      key: 'flowerName',
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
    },
    {
      title: 'Comment',
      dataIndex: 'reviewComment',
      key: 'reviewComment',
    },
    {
      title: 'Date',
      dataIndex: 'reviewDate',
      key: 'reviewDate',
      render: (date) => date ? new Date(date).toLocaleString() : 'N/A',
    },
  ];

  const handleSearch = (value) => {
    setSearchTerm(value);
    if (value) {
      const filteredReviews = reviews.filter(review => 
        review.reviewComment?.toLowerCase().includes(value.toLowerCase()) ||
        review.userName?.toLowerCase().includes(value.toLowerCase()) ||
        review.flowerName?.toLowerCase().includes(value.toLowerCase())
      );
      setReviews(filteredReviews);
    } else {
      fetchReviews();
    }
  };
  const getTabItems = () => {
    const allReviewsTab = {
        key: 'all',
        label: 'All Reviews',
        children: (
            <Table 
                columns={columns} 
                dataSource={reviews} 
                rowKey="key"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />
        )
    };

    const sellerTabs = Object.entries(groupedReviews).map(([sellerId, data]) => ({
        key: sellerId,
        label: data.sellerName,
        children: (
            <Table 
                columns={columns} 
                dataSource={data.reviews} 
                rowKey="key"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />
        )
    }));

    return [allReviewsTab, ...sellerTabs];
};

return (
    <div>
        <h2>Review Management</h2>
        <Card style={{ marginBottom: 16 }}>
            <Statistic
                title="Average Rating"
                value={stats.averageRating || 0}
                precision={2}
                prefix={<StarOutlined />}
                suffix="/ 5"
            />
            <Statistic title="Total Reviews" value={stats.totalReviews || 0} />
        </Card>
        <div style={{ marginBottom: 16 }}>
            <Input.Search
                placeholder="Search reviews"
                onSearch={handleSearch}
                style={{ width: 300 }}
                allowClear
            />
        </div>
        <Tabs defaultActiveKey="all" items={getTabItems()} />
    </div>
);
};

export default AdminReviewManagement;