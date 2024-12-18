import React, { useState, useEffect } from 'react';
import { Table, Input, Card, Statistic, message, Tabs, Row, Col, Rate, Badge, Space, Tag, Typography, Button, Dropdown, Menu } from 'antd';
import { StarOutlined, CommentOutlined, UserOutlined, ShopOutlined, FilterOutlined, ReloadOutlined, DownOutlined } from '@ant-design/icons';
import api from "../../config/axios";

const { TabPane } = Tabs;
const { Title, Text } = Typography;

const AdminReviewManagement = () => {
    const [reviews, setReviews] = useState([]);
    const [groupedReviews, setGroupedReviews] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0 });
    const [loading, setLoading] = useState(false);
    const [searchType, setSearchType] = useState('all');
  
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
            width: 100,
        },
        {
            title: 'User',
            dataIndex: 'userName',
            key: 'userName',
            width: 200,
            render: (text) => (
                <Space>
                    <UserOutlined />
                    <Text>{text}</Text>
                </Space>
            ),
            sorter: (a, b) => a.userName.localeCompare(b.userName),
        },
        {
            title: 'Flower',
            dataIndex: 'flowerName',
            key: 'flowerName',
            width: 200,
            render: (text) => (
                <Tag color="green">{text}</Tag>
            ),
        },
        {
            title: 'Rating',
            dataIndex: 'rating',
            key: 'rating',
            width: 200,
            render: (rating) => (
                <Rate disabled defaultValue={rating} style={{ fontSize: '16px' }} />
            ),
            sorter: (a, b) => a.rating - b.rating,
        },
        {
            title: 'Comment',
            dataIndex: 'reviewComment',
            key: 'reviewComment',
            width: 300,
            render: (text) => (
                <div style={{ 
                    maxWidth: '300px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap' 
                }}>
                    {text}
                </div>
            ),
        },
        {
            title: 'Date',
            dataIndex: 'reviewDate',
            key: 'reviewDate',
            width: 150,
            render: (date) => (
                <Text type="secondary">
                    {date ? new Date(date).toLocaleString('vi-VN') : 'N/A'}
                </Text>
            ),
            sorter: (a, b) => new Date(a.reviewDate) - new Date(b.reviewDate),
        },
    ];
// hàm chuyển đổi tiếng Việt
    const removeVietnameseTones = (str) => {
      str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a"); 
      str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e"); 
      str = str.replace(/ì|í|ị|ỉ|ĩ/g,"i"); 
      str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o"); 
      str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u"); 
      str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y"); 
      str = str.replace(/đ/g,"d");
      return str;
    }

    const handleSearch = (value) => {
        setSearchTerm(value);
        if (value) {
            const searchLower = value.toLowerCase();
            const searchNoTone = removeVietnameseTones(searchLower);
            
            const filtered = reviews.filter(review => {
                const userName = review.userName?.toLowerCase() || '';
                const userNameNoTone = removeVietnameseTones(userName);
                const flowerName = review.flowerName?.toLowerCase() || '';
                const flowerNameNoTone = removeVietnameseTones(flowerName);
                
                switch(searchType) {
                    case 'user':
                        return userNameNoTone.includes(searchNoTone) || 
                               userName.includes(searchLower);
                    case 'flower':
                        return flowerNameNoTone.includes(searchNoTone) || 
                               flowerName.includes(searchLower);
                    case 'all':
                    default:
                        return userNameNoTone.includes(searchNoTone) || 
                               userName.includes(searchLower) ||
                               flowerNameNoTone.includes(searchNoTone) || 
                               flowerName.includes(searchLower);
                }
            });
            setReviews(filtered);
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
        <div className="admin-review-management">
            <Card className="page-header">
                <Title level={2}>
                    <Space>
                        <CommentOutlined />
                        Quản Lý Đánh Giá
                    </Space>
                </Title>
            </Card>

            <Row gutter={16} style={{ marginTop: '16px' }}>
                <Col span={8}>
                    <Card hoverable>
                        <Statistic
                            title={<Text strong>Đánh Giá Trung Bình</Text>}
                            value={stats.averageRating || 0}
                            precision={2}
                            prefix={<StarOutlined style={{ color: '#fadb14' }} />}
                            suffix="/ 5"
                        />
                        <Rate 
                            disabled 
                            value={Math.round(stats.averageRating)} 
                            style={{ marginTop: '8px' }}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card hoverable>
                        <Statistic
                            title={<Text strong>Tổng Số Đánh Giá</Text>}
                            value={stats.totalReviews || 0}
                            prefix={<CommentOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card hoverable>
                        <Statistic
                            title={<Text strong>Số Người Bán</Text>}
                            value={Object.keys(groupedReviews).length}
                            prefix={<ShopOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            <Card style={{ marginTop: '16px' }}>
                <Space style={{ marginBottom: '16px' }}>
                    <Dropdown
                        overlay={
                            <Menu
                                selectedKeys={[searchType]}
                                onClick={({ key }) => setSearchType(key)}
                            >
                                <Menu.Item key="all">Tất cả</Menu.Item>
                                <Menu.Item key="user">User</Menu.Item>
                                <Menu.Item key="flower">Flower</Menu.Item>
                            </Menu>
                        }
                    >
                        <Button>
                            <Space>
                                <FilterOutlined />
                                {searchType === 'user' ? 'User' : 
                                 searchType === 'flower' ? 'Flower' : 
                                 'Tất cả'}
                                <DownOutlined />
                            </Space>
                        </Button>
                    </Dropdown>

                    <Input.Search
                        placeholder="Tìm kiếm đánh giá..."
                        onSearch={handleSearch}
                        onChange={(e) => handleSearch(e.target.value)}
                        style={{ width: 300 }}
                        allowClear
                    />
                    <Button 
                        icon={<ReloadOutlined />}
                        onClick={() => {
                            fetchReviews();
                            fetchStats();
                        }}
                    >
                        Làm mới
                    </Button>
                </Space>

                <Tabs 
                    defaultActiveKey="all" 
                    items={getTabItems()}
                    type="card"
                    className="custom-tabs"
                />
            </Card>

            <style jsx>{`
                .admin-review-management {
                    padding: 24px;
                }
                .page-header {
                    background: #fff;
                    margin-bottom: 16px;
                    border-radius: 8px;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.03);
                }
                .custom-tabs .ant-tabs-tab {
                    border-radius: 4px;
                    margin-right: 4px;
                }
                .ant-card {
                    border-radius: 8px;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.03);
                }
                .ant-table-thead > tr > th {
                    background: #fafafa;
                    font-weight: 600;
                }
            `}</style>
        </div>
    );
};

export default AdminReviewManagement;