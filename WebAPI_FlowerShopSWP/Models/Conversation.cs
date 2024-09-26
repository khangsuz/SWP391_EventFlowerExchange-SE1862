using System;
using System.Collections.Generic;

namespace WebAPI_FlowerShopSWP.Models;

public partial class Conversation
{
    public int ConversationId { get; set; }

    public int BuyerId { get; set; }

    public int SellerId { get; set; }

    public DateTime? StartDate { get; set; }

    public virtual User Buyer { get; set; } = null!;

    public virtual ICollection<Message> Messages { get; set; } = new List<Message>();

    public virtual User Seller { get; set; } = null!;
}
