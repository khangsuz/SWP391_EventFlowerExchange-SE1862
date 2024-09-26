using System;
using System.Collections.Generic;

namespace WebAPI_FlowerShopSWP.Models;

public partial class User
{
    public int UserId { get; set; }

    public string Name { get; set; } = null!;

    public string? Email { get; set; }

    public string Password { get; set; } = null!;

    public string? UserType { get; set; }

    public string? Address { get; set; }

    public string? Phone { get; set; }

    public DateTime? RegistrationDate { get; set; }

    public virtual ICollection<Conversation> ConversationBuyers { get; set; } = new List<Conversation>();

    public virtual ICollection<Conversation> ConversationSellers { get; set; } = new List<Conversation>();

    public virtual ICollection<Delivery> Deliveries { get; set; } = new List<Delivery>();

    public virtual ICollection<Flower> Flowers { get; set; } = new List<Flower>();

    public virtual ICollection<Message> Messages { get; set; } = new List<Message>();

    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
}
