using System;
using System.Collections.Generic;

namespace WebAPI_FlowerShopSWP.Models;

public partial class Message
{
    public int MessageId { get; set; }

    public int ConversationId { get; set; }

    public int SenderId { get; set; }

    public string MessageContent { get; set; } = null!;

    public DateTime? SendTime { get; set; }

    public bool? IsRead { get; set; }

    public virtual Conversation Conversation { get; set; } = null!;

    public virtual User Sender { get; set; } = null!;
}
